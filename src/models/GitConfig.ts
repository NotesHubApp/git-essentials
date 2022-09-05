// This is straight from parse_unit_factor in config.c of canonical git
const num = (val: string) => {
  val = val.toLowerCase()
  let n = parseInt(val)
  if (val.endsWith('k')) n *= 1024
  if (val.endsWith('m')) n *= 1024 * 1024
  if (val.endsWith('g')) n *= 1024 * 1024 * 1024
  return n
}

// This is straight from git_parse_maybe_bool_text in config.c of canonical git
const bool = (val: string) => {
  val = val.trim().toLowerCase()
  if (val === 'true' || val === 'yes' || val === 'on') return true
  if (val === 'false' || val === 'no' || val === 'off') return false
  throw Error(
    `Expected 'true', 'false', 'yes', 'no', 'on', or 'off', but got ${val}`
  )
}

const schema = new Map([
  ['core', new Map<string | null, (val: string) => boolean | number | string>([
    ['filemode', bool],
    ['bare', bool],
    ['logallrefupdates', bool],
    ['symlinks', bool],
    ['ignorecase', bool],
    ['bigFileThreshold', num]
  ])]
])

// https://git-scm.com/docs/git-config#_syntax

// section starts with [ and ends with ]
// section is alphanumeric (ASCII) with - and .
// section is case insensitive
// subsection is optionnal
// subsection is specified after section and one or more spaces
// subsection is specified between double quotes
const SECTION_LINE_REGEX = /^\[([A-Za-z0-9-.]+)(?: "(.*)")?\]$/
const SECTION_REGEX = /^[A-Za-z0-9-.]+$/

// variable lines contain a name, and equal sign and then a value
// variable lines can also only contain a name (the implicit value is a boolean true)
// variable name is alphanumeric (ASCII) with -
// variable name starts with an alphabetic character
// variable name is case insensitive
const VARIABLE_LINE_REGEX = /^([A-Za-z][A-Za-z-]*)(?: *= *(.*))?$/
const VARIABLE_NAME_REGEX = /^[A-Za-z][A-Za-z-]*$/

const VARIABLE_VALUE_COMMENT_REGEX = /^(.*?)( *[#;].*)$/

const extractSectionLine = (line: string) => {
  const matches = SECTION_LINE_REGEX.exec(line)
  if (matches != null) {
    const [section, subsection] = matches.slice(1)
    return [section, subsection]
  }
  return null
}

const extractVariableLine = (line: string) => {
  const matches = VARIABLE_LINE_REGEX.exec(line)
  if (matches != null) {
    const [name, rawValue = 'true'] = matches.slice(1)
    const valueWithoutComments = removeComments(rawValue)
    const valueWithoutQuotes = removeQuotes(valueWithoutComments)
    return [name, valueWithoutQuotes]
  }
  return null
}

const removeComments = (rawValue: string) => {
  const commentMatches = VARIABLE_VALUE_COMMENT_REGEX.exec(rawValue)
  if (commentMatches == null) {
    return rawValue
  }
  const [valueWithoutComment, comment] = commentMatches.slice(1)
  // if odd number of quotes before and after comment => comment is escaped
  if (
    hasOddNumberOfQuotes(valueWithoutComment) &&
    hasOddNumberOfQuotes(comment)
  ) {
    return `${valueWithoutComment}${comment}`
  }
  return valueWithoutComment
}

const hasOddNumberOfQuotes = (text: string) => {
  const numberOfQuotes = (text.match(/(?:^|[^\\])"/g) || []).length
  return numberOfQuotes % 2 !== 0
}

const removeQuotes = (text: string) => {
  return text.split('').reduce((newText, c, idx, text) => {
    const isQuote = c === '"' && text[idx - 1] !== '\\'
    const isEscapeForQuote = c === '\\' && text[idx + 1] === '"'
    if (isQuote || isEscapeForQuote) {
      return newText
    }
    return newText + c
  }, '')
}

const lower = (text: string | null) => {
  return text !== null ? text.toLowerCase() : null
}

const getPath = (section: string | null, subsection: string | null, name: string | null) => {
  return [lower(section), subsection, lower(name)]
    .filter(a => a != null)
    .join('.')
}

const findLastIndex = <T>(array: T[], callback: (item: T) => boolean): number => {
  return array.reduce((lastIndex, item, index) => {
    return callback(item) ? index : lastIndex
  }, -1)
}

type ConfigEntry = {
  line?: string
  isSection: boolean
  section: string
  subsection: string | null
  name: string | null
  value: string | null
  path: string
  modified?: boolean
}

// Note: there are a LOT of edge cases that aren't covered (e.g. keys in sections that also
// have subsections, [include] directives, etc.
export class GitConfig {
  private parsedConfig: ConfigEntry[]

  constructor(text: string) {
    let section: string | null = null
    let subsection: string | null = null
    this.parsedConfig = text.split('\n').map(line => {
      let name = null
      let value = null

      const trimmedLine = line.trim()
      const extractedSection = extractSectionLine(trimmedLine)
      const isSection = extractedSection != null
      if (isSection) {
        ;[section, subsection] = extractedSection
      } else {
        const extractedVariable = extractVariableLine(trimmedLine)
        const isVariable = extractedVariable != null
        if (isVariable) {
          ;[name, value] = extractedVariable
        }
      }

      const path = getPath(section, subsection, name)
      return { line, isSection, section: section!, subsection, name, value, path }
    })
  }

  static from(text: string) {
    return new GitConfig(text)
  }

  async get(path: string, getall = false) {
    const allValues = this.parsedConfig
      .filter(config => config.path === path.toLowerCase())
      .map(({ section, name, value }) => {
        const fn = schema.get(section)?.get(name)
        return fn && value ? fn(value) : value
      })
    return getall ? allValues : allValues.pop()
  }

  async getall(path: string) {
    return this.get(path, true)
  }

  async getSubsections(section: string) {
    return this.parsedConfig
      .filter(config => config.section === section && config.isSection)
      .map(config => config.subsection)
  }

  async deleteSection(section: string, subsection: string) {
    this.parsedConfig = this.parsedConfig.filter(
      config => !(config.section === section && config.subsection === subsection)
    )
  }

  async append(path: string, value: string) {
    return this.set(path, value, true)
  }

  async set(path: string, value: string, append: boolean = false) {
    const configIndex = findLastIndex(
      this.parsedConfig,
      config => config.path === path.toLowerCase()
    )

    if (value == null) {
      if (configIndex !== -1) {
        this.parsedConfig.splice(configIndex, 1)
      }
    } else {
      if (configIndex !== -1) {
        const config = this.parsedConfig[configIndex]
        const modifiedConfig = Object.assign({}, config, {
          value,
          modified: true,
        })
        if (append) {
          this.parsedConfig.splice(configIndex + 1, 0, modifiedConfig)
        } else {
          this.parsedConfig[configIndex] = modifiedConfig
        }
      } else {
        const sectionPath = path
          .split('.')
          .slice(0, -1)
          .join('.')
          .toLowerCase()
        const sectionIndex = this.parsedConfig.findIndex(
          config => config.path === sectionPath
        )
        const [section, subsection] = sectionPath.split('.')
        const name = path.split('.').pop() ?? null
        const newConfig: ConfigEntry = {
          isSection: false,
          section,
          subsection,
          name,
          value,
          modified: true,
          path: getPath(section, subsection, name),
        }

        if (SECTION_REGEX.test(section) && name && VARIABLE_NAME_REGEX.test(name)) {
          if (sectionIndex >= 0) {
            // Reuse existing section
            this.parsedConfig.splice(sectionIndex + 1, 0, newConfig)
          } else {
            // Add a new section
            const newSection: ConfigEntry = {
              isSection: true,
              section,
              subsection,
              name: null,
              value: null,
              modified: true,
              path: getPath(section, subsection, null),
            }
            this.parsedConfig.push(newSection, newConfig)
          }
        }
      }
    }
  }

  toString() {
    return this.parsedConfig
      .map(({ line, section, subsection, name, value, modified = false }) => {
        if (!modified) {
          return line
        }
        if (name != null && value != null) {
          return `\t${name} = ${value}`
        }
        if (subsection != null) {
          return `[${section} "${subsection}"]`
        }
        return `[${section}]`
      })
      .join('\n')
  }
}
