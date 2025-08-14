import { DATA_SOURCE } from '../../config'
import * as pbAuth from './pocketbase-auth'
import * as localAuth from './local-auth'

const impl = DATA_SOURCE === 'pocketbase' ? pbAuth : localAuth

export const auth = impl


