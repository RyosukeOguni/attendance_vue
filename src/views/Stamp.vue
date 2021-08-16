<template>
  <div class="wrapper d-flex justify-content-between">
    <v-progress-linear
      :active="loading"
      :indeterminate="loading"
      absolute
      top
      color="orange accent-2"
    ></v-progress-linear>
    <div class="main text-center">
      <p class="schoolname">{{ schoolName }}</p>
      <p class="todaydate">today->isoFormat('YYYY年M月D日（ddd）')</p>
      <p class="timer display-3">{{ timer }}</p>

      <div v-if="!!Object.keys(stamp).length" class="stampbox">
        <p class="username">
          <span class="display-2">{{ stamp.name }}</span
          >さん
        </p>
        <!-- 退席 -->
        <div v-if="stamp.attendance_status === 1">
          <v-btn class="bt_round" :loading="bt_loading" @click="updateAtData(stamp)">
            OUT
          </v-btn>
        </div>
        <!-- 退席後 -->
        <div v-else-if="stamp.attendance_status === 2">
          <p class="msg">本日はお疲れ様でした！</p>
          <p class="msg">右リストから利用者名を選択して下さい</p>
        </div>
        <!-- 出席 -->
        <div v-else>
          <v-btn class="bt_round" :loading="bt_loading" @click="addAtData(stamp)">
            IN
          </v-btn>
        </div>
      </div>

      <div v-else class="stampbox">
        <p class="msg">右リストから利用者名を選択して下さい</p>
      </div>
    </div>

    <div class="side d-flex flex-row">
      <v-list-item-group :loading="loading" class="userslist">
        <v-list-item
          v-for="stamp in stampData"
          :key="stamp.id"
          @click="setOneStamp(stamp)"
          >{{ stamp.name }}
          <p
            v-if="stamp.attendance_status === 1"
            class="namebox_attend_in d-inline-block text-center ml-2"
          >
            出席中
          </p>
          <p
            v-else-if="stamp.attendance_status === 2"
            class="namebox_attend_out d-inline-block text-center ml-2"
          >
            退席済
          </p>
        </v-list-item>
      </v-list-item-group>
      <v-list-item-group class="kanaindex">
        <v-list-item dense class="justify-center">ALL</v-list-item>
        <v-list-item dense class="justify-center">ア</v-list-item>
        <v-list-item dense class="justify-center">カ</v-list-item>
        <v-list-item dense class="justify-center">サ</v-list-item>
        <v-list-item dense class="justify-center">タ</v-list-item>
        <v-list-item dense class="justify-center">ナ</v-list-item>
        <v-list-item dense class="justify-center">ハ</v-list-item>
        <v-list-item dense class="justify-center">マ</v-list-item>
        <v-list-item dense class="justify-center">ヤ</v-list-item>
        <v-list-item dense class="justify-center">ラ</v-list-item>
        <v-list-item dense class="justify-center">ワ</v-list-item>
      </v-list-item-group>
    </div>
  </div>
</template>

<script>
import common from '../plugins/common'
import axios from 'axios'
import { mapState } from 'vuex'
export default {
  name: 'Stamp',
  data() {
    return {
      /** ローディング状態 */
      loading: false,
      bt_loading: false,
      /** 所属校をルートパラメーターから取得 */
      school_id: this.$route.params.id,
      /** 時刻 */
      timer: '',
      /** 打刻対象者リスト */
      stampData: [],
      stamp: {},
    }
  },
  watch: {
    $route() {
      this.school_id = this.$route.params.id
      this.stampData = []
      this.stamp = {}
      this.updateTable()
    },
  },
  created() {
    /** 1秒ごとにtimerSet()を実行 */
    setInterval(() => {
      /** () => {}でmethodsを囲まないと動かない */
      this.timerSet()
    }, 1000)
    /** 打刻対象者を取得 */
    this.updateTable()
  },
  computed: {
    /** settingモジュールからstateを呼び出し */
    ...mapState('setting', ['schools']),
    schoolName() {
      const school = this.schools.find((data) => {
        return data.id === this.school_id
      })
      return school
    },
  },
  methods: {
    /** 利用者テーブルを更新 */
    async updateTable() {
      this.loading = true
      await this.getAtData()
      this.loading = false
    },

    /** 利用者をAPIから取得 */
    async getAtData() {
      return await axios
        .get(`api/stamps?school_id=${this.school_id}`)
        .then((response) => {
          this.stampData = response.data.data.map((data) => {
            let attribute = data.data.attribute
            return attribute
          })
        })
        .catch(() => {
          this.stampData = []
        })
    },
    /** 出席 */
    async addAtData(stamp) {
      this.bt_loading = true
      let json = {
        user_id: stamp.id,
        insert_date: common.getYearMonthDay(),
        start: this.timer,
      }
      return await axios
        .post('api/stamps', json)
        .then((response) => {
          let attribute = response.data.data.attribute
          this.stampData = this.stampData.map((data) => {
            if (data.id === attribute.id) {
              return attribute
            }
            return data
          })
          this.stamp = attribute
          this.bt_loading = false
        })
        .catch(() => {
          this.bt_loading = false
        })
    },

    /** 退席 */
    async updateAtData(stamp) {
      this.bt_loading = true
      let json = { end: this.timer }
      return await axios
        .put('api/stamps/' + stamp.attendance_id, json)
        .then((response) => {
          let attribute = response.data.data.attribute
          this.stampData = this.stampData.map((data) => {
            if (data.id === attribute.id) {
              return attribute
            }
            return data
          })
          this.stamp = attribute
          this.bt_loading = false
        })
        .catch(() => {
          this.bt_loading = false
        })
    },
    setOneStamp(stamp) {
      this.stamp = stamp
    },
    /** 現在時刻を00:00:00で取得 */
    timerSet() {
      common.showClock((timer) => {
        this.timer = timer
      })
    },
  },
}
</script>
<style scoped>
.main {
  min-width: inherit;
  width: 60%;
  padding: 2% 0;
}
.main .stampbox {
  margin-top: 10%;
}
.main .bt_round {
  display: inline-block;
  text-align: center;
  cursor: pointer;
  background: #1976d2;
  color: #ffffff;
  line-height: 1em;
  transition: 0.3s;
  border: #fff solid 2px;
  width: 3em;
  height: 3em;
  font-size: 3rem;
  border-radius: 50%;
}
.main .bt_round:hover {
  color: #1976d2;
  background: #ffffff;
}

.side {
  min-width: fit-content;
  width: 40%;
  background: #fff;
}
.side .userslist {
  min-width: fit-content;
  width: 85%;
  overflow: auto;
  border-right: #1976d2 solid 4px;
  overflow-x: hidden;
  height: calc(100vh - 48px);
}
.side .kanaindex {
  width: 15%;
}
.side .v-list-item {
  border-bottom: #1976d2 solid 1px !important;
  color: #1976d2 !important;
}
.side .namebox_name {
  margin-bottom: 0;
}
.side .namebox {
  margin-bottom: 0.25rem;
  margin-right: 1rem;
  margin-top: 0.25rem;
}
.side .namebox_id {
  width: 3em;
}
.side .namebox_attend_in {
  background-color: #1976d2;
  color: #fff;
  border-radius: 0.2rem;
  padding: 0.25rem 0.5rem;
  margin-bottom: 0;
}
.side .namebox_attend_out {
  background-color: #ccc;
  color: #fff;
  border-radius: 0.2rem;
  padding: 0.2rem 0.5rem;
  margin-bottom: 0;
}
</style>
