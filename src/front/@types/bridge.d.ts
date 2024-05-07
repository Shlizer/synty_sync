import { api } from '../../back/bridge'

declare global {
  // eslint-disable-next-line
  interface Window {
    Api: typeof api
  }
}
