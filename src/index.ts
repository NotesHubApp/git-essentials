import { add } from './api/add'
import { clone } from './api/clone'
import { commit } from './api/commit'
import { currentBranch } from './api/currentBranch.js'
import { log } from './api/log'
import { pull } from './api/pull'
import { push } from './api/push'
import { remove } from './api/remove'

// named exports
export {
  add,
  clone,
  commit,
  currentBranch,
  log,
  pull,
  push,
  remove
}

// default export
export default {
  add,
  clone,
  commit,
  currentBranch,
  log,
  pull,
  push,
  remove
}
