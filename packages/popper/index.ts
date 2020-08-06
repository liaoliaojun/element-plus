import { App } from 'vue'
import Popper from './src/index.vue'
export default (app: App): void => {
  app.component(Popper.name, Popper)
}
