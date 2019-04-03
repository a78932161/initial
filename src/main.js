import Vue from 'vue'
import provide from './apollo';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App'
import router from './router'
import store from './store'

import '@/icons' // icon
import VueQuillEditor from 'vue-quill-editor'
import '@/permission' // permission control
import {baseURL} from "api/config";

Vue.use(ElementUI);
Vue.use(VueQuillEditor)
Vue.config.productionTip = false

import ElementField from './field';

Vue.use(ElementField);

ElementField.upload({
  sts: `${baseURL}/sts`,
  prefix: 'https://image.buymycar.cn/',
});


new Vue({
  el: '#app',
  router,
  store,
  provide,
  template: '<App/>',
  components: {App}
});
