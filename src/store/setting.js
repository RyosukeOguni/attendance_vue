import axios from 'axios'

export default {
  namespaced: true,

  state: {
    schools: [],
    /** 読込状態 */
    loading: false,
    /** エラーメッセージ */
    errorMessage: '',
  },

  mutations: {
    // ▼ コールバック関数で受け取った処理をstateに行う
    stateInput(state, callback) {
      callback(state)
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
    // ▼ 非同期通信でDBから利用者一覧データを取得
    async getSchools({ commit }) {
      commit('setLoading', { value: true })
      await axios
        .get('api/schools')
        .then((response) => {
          console.log(response)
          // stateに反映
          commit('stateInput', (state) => {
            state.schools = response.data.data.map((data) => {
              let attribute = data.data.attribute
              return attribute
            })
          })
        })
        .catch((error) => {
          commit('setErrorMessage', { message: error })
        })
      commit('setLoading', { value: false })
    },

    // ▼ コールバック関数で受け取った処理をそのままmutationsに送る
    stateInput({ commit }, callback) {
      commit('stateInput', callback)
    },
  },
}
