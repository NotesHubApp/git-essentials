import * as Models from './models/index'
import * as Errors from './errors/index'

import { add } from './api/add'
import { addRemote } from './api/addRemote'
// import { clone } from './api/clone'
// import { commit } from './api/commit'
import { currentBranch } from './api/currentBranch'
import { getConfig } from './api/getConfig'
import { getConfigAll } from './api/getConfigAll'
import { init } from './api/init'
import { log } from './api/log'
// import { pull } from './api/pull'
// import { push } from './api/push'
import { remove } from './api/remove'
import { setConfig } from './api/setConfig'

// named exports
export {
  Models,
  Errors,
  add,
  addRemote,
  // clone,
  // commit,
  currentBranch,
  getConfig,
  getConfigAll,
  init,
  log,
  // pull,
  // push,
  remove,
  setConfig
}

// default export
export default {
  Models,
  Errors,
  add,
  addRemote,
  // clone,
  // commit,
  currentBranch,
  getConfig,
  getConfigAll,
  init,
  log,
  // pull,
  // push,
  remove,
  setConfig
}
