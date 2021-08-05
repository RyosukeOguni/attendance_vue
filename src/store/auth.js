import axios from 'axios'
export default {
  namespaced: true,
  state: {
    isAuth: false,
    user: null,
    loading: false,
    /** エラーメッセージ */
    errorMessage: '',
  },
  getters: {
    isAuth(state) {
      return state.isAuth
    },
    user(state) {
      return state.user
    },
  },
  mutations: {
    SET_IS_AUTH(state, value) {
      state.isAuth = value
    },
    SET_USER(state, value) {
      state.user = value
    },
    setLoading(state, { value }) {
      state.loading = value
    },
    /** エラーメッセージをセットします */
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
        commit('SET_IS_AUTH', false)
        commit('setLoading', { value: false })
      }
    },
    // 疎通確認
    async loginTest({ commit }) {
      return await axios
        .get('api/admin')
        .then((response) => {
          commit('SET_IS_AUTH', true)
          commit('SET_USER', response.data)
        })
        .catch(() => {
          commit('SET_IS_AUTH', false)
          commit('SET_USER', null)
        })
    },
  },
}
