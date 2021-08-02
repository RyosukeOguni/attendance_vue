import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import axios from 'axios'

Vue.config.productionTip = false
// ↓cookie認証をapiに返却する
axios.defaults.withCredentials = true
// ↓apiのドメインを設定
axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app')
