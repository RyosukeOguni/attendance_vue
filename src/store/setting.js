import axios from 'axios'

export default {
  namespaced: true,

  state: {
    schools: [],
  },

  mutations: {
    // ▼ コールバック関数で受け取った処理をstateに行う
    stateInput(state, callback) {
      callback(state)
    },
  },

  actions: {
    // ▼ 非同期通信でDBから利用者一覧データを取得
    async getSchools({ commit }) {
      await axios
        .get('schools')
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
          console.log(error)
        })
    },

    // ▼ コールバック関数で受け取った処理をそのままmutationsに送る
    stateInput({ commit }, callback) {
      commit('stateInput', callback)
    },
  },
}
