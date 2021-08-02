import Vue from 'vue'
import Vuex from 'vuex'
import setting from './setting'
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    setting,
  },
})
