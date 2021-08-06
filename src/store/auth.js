import axios from 'axios'
export default {
  namespaced: true,
  state: {
    /** 認証状態 */
    isAuth: false,
    /** 認証状態 */
    admin: null,
    /** 読込状態 */
    loading: false,
    /** エラーメッセージ */
    errorMessage: '',
  },
  getters: {
    isAuth(state) {
      return state.isAuth
    },
    admin(state) {
      return state.admin
    },
  },
  mutations: {
    setAuth(state, value) {
      state.isAuth = value
    },
    setAdmin(state, value) {
      state.admin = value
    },
    /** 読込状態をセット */
    setLoading(state, { value }) {
      state.loading = value
    },
    /** エラーメッセージをセット */
    setErrorMessage(state, { message }) {
      state.errorMessage = message
    },
  },
  actions: {
    /** ログイン */
    async login({ commit, dispatch }, item) {
      commit('setLoading', { value: true })
      try {
        await axios.get('sanctum/csrf-cookie')
        await axios.post('api/login', item)
        await dispatch('loginTest')
      } catch (e) {
        commit('setErrorMessage', { message: e })
      } finally {
        commit('setLoading', { value: false })
      }
    },
    /** ログアウト */
    async logout({ commit }) {
      commit('setLoading', { value: true })
      try {
        await axios.get('sanctum/csrf-cookie')
        await axios.post('api/logout')
      } catch (e) {
        commit('setErrorMessage', { message: e })
      } finally {
        commit('setAuth', false)
        commit('setAdmin', null)
        commit('setLoading', { value: false })
      }
    },
    // 疎通確認
    async loginTest({ commit }) {
      return await axios
        .get('api/admin')
        .then((response) => {
          commit('setAuth', true)
          commit('setAdmin', response.data)
        })
        .catch(() => {
          commit('setAuth', false)
          commit('setAdmin', null)
        })
    },
  },
}
