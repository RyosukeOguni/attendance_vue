import axios from 'axios'

export default {
  namespaced: true,

  state: {
    /** 所属校 */
    schools: [],
    /** 備考 */
    notes: [],
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
  },

  actions: {
    // ▼ 非同期通信でDBから利用者一覧データを取得
    async getSettings({ dispatch, commit }) {
      commit('setLoading', { value: true })
      await dispatch('getSchools')
      await dispatch('getNotes')
      commit('setLoading', { value: false })
    },

    // 所属校取得
    async getSchools({ commit }) {
      return await axios
        .get('api/schools')
        .then((response) => {
          commit('stateInput', (state) => {
            state.schools = response.data.data.map((data) => {
              let attribute = data.data.attribute
              return attribute
            })
          })
        })
        .catch(() => {
          commit('stateInput', (state) => {
            state.schools = []
          })
        })
    },

    // 備考取得
    async getNotes({ commit }) {
      return await axios
        .get('api/notes')
        .then((response) => {
          commit('stateInput', (state) => {
            state.notes = response.data.data.map((data) => {
              let attribute = data.data.attribute
              return attribute
            })
          })
        })
        .catch(() => {
          commit('stateInput', (state) => {
            state.notes = []
          })
        })
    },

    // ▼ コールバック関数で受け取った処理をそのままmutationsに送る
    stateInput({ commit }, callback) {
      commit('stateInput', callback)
    },
  },
}
