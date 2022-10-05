import { ConfigPath, ConfigValue } from './_common'

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
  ['core', new Map<string | undefined, (val: string) => boolean | number | string>([
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

const lower = (text?: string) => {
  return text != null ? text.toLowerCase() : undefined
}

const getPath = (section?: string, subsection?: string, name?: string) => {
  return [lower(section), subsection, lower(name)]
    .filter(a => a != null)
    .join('.')
}

const normalizePath = (path: string) => {
  const pathSegments = path.split('.')
  const section = pathSegments.shift()!
  const name = pathSegments.pop()
  const subsection = pathSegments.length ? pathSegments.join('.') : undefined

  return {
    section,
    subsection,
    name,
    path: getPath(section, subsection, name),
    sectionPath: getPath(section, subsection, undefined),
  }
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
  subsection?: string
  name?: string
  value?: string
  path: string
  modified?: boolean
}

/**
 * Note: there are a LOT of edge cases that aren't covered (e.g. keys in sections that also
 * have subsections, [include] directives, etc.
 * @internal
 */
export class GitConfig {
  private parsedConfig: ConfigEntry[]

  constructor(text: string) {
    let section: string | undefined = undefined
    let subsection: string | undefined = undefined

    this.parsedConfig = text.split('\n').map(line => {
      let name: string | undefined = undefined
      let value: string | undefined = undefined

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

  getall<T extends ConfigPath>(path: T): (ConfigValue<T> | undefined)[] {
    const normalizedPath = normalizePath(path).path
    return this.parsedConfig
      .filter(config => config.path === normalizedPath)
      .map(({ section, name, value }) => {
        const fn = schema.get(section)?.get(name)
        return (fn && value ? fn(value) : value) as ConfigValue<T>
      })
  }

  get<T extends ConfigPath>(path: T): ConfigValue<T> | undefined {
    return this.getall(path).pop()
  }

  getSubsections(section: string) {
    return this.parsedConfig
      .filter(config => config.section === section && config.isSection)
      .map(config => config.subsection)
  }

  deleteSection(section: string, subsection?: string) {
    this.parsedConfig = this.parsedConfig.filter(
      config => !(config.section === section && config.subsection === subsection)
    )
  }

  append<T extends ConfigPath>(path: T, value: ConfigValue<T> | undefined) {
    return this.set(path, value, true)
  }

  set<T extends ConfigPath>(path: T, value?: ConfigValue<T>, append: boolean = false) {
    const {
      section,
      subsection,
      name,
      path: normalizedPath,
      sectionPath,
    } = normalizePath(path)

    const configIndex = findLastIndex(
      this.parsedConfig,
      config => config.path === normalizedPath
    )

    if (value == null) {
      if (configIndex !== -1) {
        this.parsedConfig.splice(configIndex, 1)
      }
    } else {
      if (configIndex !== -1) {
        const config = this.parsedConfig[configIndex]
        // Name should be overwritten in case the casing changed
        const modifiedConfig = Object.assign({}, config, {
          name,
          value: String(value),
          modified: true,
        })

        if (append) {
          this.parsedConfig.splice(configIndex + 1, 0, modifiedConfig)
        } else {
          this.parsedConfig[configIndex] = modifiedConfig
        }
      } else {
        const sectionIndex = this.parsedConfig.findIndex(
          config => config.path === sectionPath
        )

        const newConfig: ConfigEntry = {
          isSection: false,
          section,
          subsection,
          name,
          value: String(value),
          modified: true,
          path: normalizedPath,
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
              name: undefined,
              value: undefined,
              modified: true,
              path: sectionPath,
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
          if (typeof value === 'string' && /[#;]/.test(value)) {
            // A `#` or `;` symbol denotes a comment, so we have to wrap it in double quotes
            return `\t${name} = "${value}"`
          }
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
