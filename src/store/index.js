import Vue from 'vue'
import Vuex from 'vuex'
import setting from './setting'
import auth from './auth'
import attendance from './attendance'
import user from './user'
import stamp from './stamp'
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    setting,
    auth,
    attendance,
    user,
    stamp,
  },
})
