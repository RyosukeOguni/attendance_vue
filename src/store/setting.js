import axios from 'axios'

export default {
  namespaced: true,

  state: {
    /** 本日の日付 */
    today: '',
    /** 所属校 */
    schools: [],
    /** 備考 */
    notes: [],
    /** 読込状態 */
    loading: false,
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
      await dispatch('getYearMonthDay')
      await dispatch('getSchools')
      commit('setLoading', { value: false })
      await dispatch('getNotes')
    },

    /** 所属校取得 */
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

    /** 備考取得 */
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

    /** 本日の年月日を取得 */
    getYearMonthDay({ commit }) {
      const today = new Date()
      const year = today.getFullYear()
      const month = ('0' + (today.getMonth() + 1)).slice(-2)
      const day = ('0' + today.getDate()).slice(-2)
      commit('stateInput', (state) => {
        state.today = `${year}-${month}-${day}`
      })
    },

    /** コールバック関数で受け取った処理をそのままmutationsに送る */
    stateInput({ commit }, callback) {
      commit('stateInput', callback)
    },
  },
}
