import Vue from 'vue'
import Vuex from 'vuex'
import setting from './setting'
import auth from './auth'
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    setting,
    auth,
  },
})
