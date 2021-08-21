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
      <!-- computed内のオブジェクトからプロパティを取り出す場合、v-if="schoolName"をしておく -->
      <p class="schoolname" v-if="schoolName">{{ schoolName.school_name }}</p>
      <p class="todaydate">{{ changeYearMonthDayWeek }}</p>
      <p class="timer display-3">{{ timer }}</p>
      <!-- 打刻者リストから打刻者が選択された場合に表示 -->
      <div v-if="!!Object.keys(stampData).length" class="mt-10">
        <p class="username">
          <span class="display-2">{{ stampData.name }}</span
          >さん
        </p>
        <!-- 退席 -->
        <div v-if="stampData.attendance_status === 1" class="mt-10">
          <v-btn class="bt_round" :loading="bt_loading" @click="updateAtData(stampData)">
            OUT
          </v-btn>
        </div>
        <!-- 退席後 -->
        <div v-else-if="stampData.attendance_status === 2" class="mt-10">
          <p class="msg">
            本日はお疲れ様でした！<br />右リストから利用者名を選択して下さい
          </p>
        </div>
        <!-- 出席 -->
        <div v-else class="mt-10">
          <v-btn class="bt_round" :loading="bt_loading" @click="addAtData(stampData)">
            IN
          </v-btn>
        </div>
      </div>
      <!-- 打刻者未選択 -->
      <div v-else class="stampbox">
        <p class="msg">右リストから利用者名を選択して下さい</p>
      </div>
    </div>

    <!-- 打刻者リスト -->
    <div class="side d-flex flex-row">
      <v-list-item-group :loading="loading" class="userslist">
        <v-list-item
          v-for="stamp in stampListFilter"
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
      <!-- カナインデックス -->
      <v-list-item-group class="kanaindex">
        <v-list-item
          v-for="(value, key) in kanaIndex"
          :key="key"
          @click="kanaFilter(value)"
          dense
          class="justify-center"
          >{{ key }}</v-list-item
        >
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
      /** カナインデックス */
      index: '*',
      /** 所属校をルートパラメーターから取得 */
      school_id: this.$route.params.id,
      /** 時刻 */
      timer: '',
      /** 打刻者リスト */
      stampList: [],
      /** 打刻者 */
      stampData: {},
    }
  },

  watch: {
    /** ルートパラメーターが変更された場合 */
    $route() {
      this.school_id = this.$route.params.id
      this.stampList = []
      this.stampData = {}
      this.index = '*'
      this.updateTable()
    },
  },

  created() {
    /** 1秒ごとにtimerSet()を実行 */
    setInterval(() => {
      /**  () => {}でtimerSet()を囲まないと動かない！ */
      this.timerSet()
    }, 1000)

    /** 打刻者リストを取得 */
    this.updateTable()
  },

  computed: {
    /** settingモジュールからstateを呼び出し */
    ...mapState('setting', ['schools']),
    /** storeから取得したschoolsからルートパスのidで所属校を取り出し */
    schoolName() {
      return this.schools.find((data) => {
        return data.id == this.school_id
      })
    },
    /** 年月日（曜日）を取得 */
    changeYearMonthDayWeek() {
      return common.changeYearMonthDayWeek(new Date())
    },
    /** 打刻者リストをカナインデックスでfilter */
    stampListFilter() {
      let list = this.stampList
      if (this.index !== '*') {
        list = list.filter((data) => {
          return ~this.index.indexOf(data.name_kana.slice(0, 1))
        })
      }
      return list
    },
    /** カナインデックス */
    kanaIndex() {
      return {
        ALL: '*',
        ア: 'アイウエオ',
        カ: 'カキクケコ',
        サ: 'サシスセソ',
        タ: 'タチツテト',
        ナ: 'ナニヌネノ',
        ハ: 'ハヒフヘホ',
        マ: 'マミムメモ',
        ヤ: 'ヤユヨ',
        ラ: 'ラリルレロ',
        ワ: 'ワ',
      }
    },
  },

  methods: {
    /** カナインデックスが押された時 */
    kanaFilter(kana) {
      this.index = kana
    },
    /** 打刻者リストを更新 */
    async updateTable() {
      this.loading = true
      await this.getAtData()
      this.loading = false
    },
    /** 打刻者リストをAPIから取得 */
    async getAtData() {
      return await axios
        .get(`api/stamps?school_id=${this.school_id}`)
        .then((response) => {
          this.stampList = response.data.data
            .map((data) => {
              let attribute = data.data.attribute
              return attribute
            })
            //** 読み仮名順に並び替え */
            .sort((x, y) => x.name_kana.localeCompare(y.name_kana, 'ja'))
        })
        .catch(() => {
          this.stampList = []
        })
    },
    /** 出席 */
    async addAtData(stamp) {
      this.bt_loading = true
      let json = {
        user_id: stamp.id,
        insert_date: common.getYearMonthDay(),
        start: common.getRoundUpTime(),
      }
      return await axios
        .post('api/stamps', json)
        .then((response) => {
          let attribute = response.data.data.attribute
          this.stampList = this.stampList.map((data) => {
            if (data.id === attribute.id) {
              return attribute
            }
            return data
          })
          this.stampData = attribute
          this.bt_loading = false
        })
        .catch(() => {
          this.bt_loading = false
        })
    },
    /** 退席 */
    async updateAtData(stamp) {
      this.bt_loading = true
      let json = { end: common.getRoundUpTime() }
      return await axios
        .put('api/stamps/' + stamp.attendance_id, json)
        .then((response) => {
          let attribute = response.data.data.attribute
          this.stampList = this.stampList.map((data) => {
            if (data.id === attribute.id) {
              return attribute
            }
            return data
          })
          this.stampData = attribute
          this.bt_loading = false
        })
        .catch(() => {
          this.bt_loading = false
        })
    },
    /** 打刻者リストが押された時、メイン画面に打刻者を表示 */
    setOneStamp(stamp) {
      this.stampData = stamp
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
