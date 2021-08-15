<template>
  <div class="wrapper stamp d-flex justify-content-between">
    <div class="main text-center">
      <p class="schoolname">school->getName()</p>
      <p class="todaydate">today->isoFormat('YYYY年M月D日（ddd）')</p>
      <p class="timer display-1">{{ timer }}</p>

      @yield('date') @yield('timer') @yield('userarea')
    </div>
    <div class="side d-flex flex-row">
      <v-list-item-group class="userslist">
        <v-list-item>ALL</v-list-item>
        <v-list-item>ア</v-list-item>
        <v-list-item>カ</v-list-item>
        <v-list-item>サ</v-list-item>
        <v-list-item>タ</v-list-item>
        <v-list-item>ナ</v-list-item>
        <v-list-item>ハ</v-list-item>
        <v-list-item>マ</v-list-item>
        <v-list-item>ヤ</v-list-item>
        <v-list-item>ラ</v-list-item>
        <v-list-item>ワ</v-list-item>
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

export default {
  name: 'Stamp',
  data: () => ({
    timer: '',
  }),
  created() {
    setInterval(() => {
      this.timerSet()
    }, 1000)
  },
  computed: {},
  methods: {
    timerSet() {
      common.showClock((timer) => {
        this.timer = timer
      })
    },
  },
}
</script>
<style scoped>
/* 打刻画面 */
.container {
  background-color: #1976d2;
  color: #ffffff;
}

.stamp .main {
  min-width: inherit;
  width: 60%;
  padding: 2% 0;
}

.stamp .main .stampbox {
  margin-top: 10%;
}

.stamp .side {
  min-width: fit-content;
  width: 40%;
  background: #fff;
}

.stamp .side .userslist {
  min-width: fit-content;
  width: 85%;
  overflow: auto;
  border-right: #1976d2 solid 4px;
  overflow-x: hidden;
  height: calc(100vh - 48px);
}

.stamp .side .kanaindex {
  width: 15%;
}

.stamp .side .v-list-item {
  border-bottom: #1976d2 solid 1px;
  color: #1976d2;
}

.stamp .side .namebox_name {
  margin-bottom: 0;
}

.stamp .side .namebox {
  margin-bottom: 0.25rem;
  margin-right: 1rem;
  margin-top: 0.25rem;
}

.stamp .side .namebox_id {
  width: 3em;
}

.stamp .side .namebox_attend_in {
  background-color: #1976d2;
  color: #fff;
  border-radius: 0.2rem;
  padding: 0.25rem 0.5rem;
  margin-bottom: 0;
}

.stamp .side .namebox_attend_out {
  background-color: #ccc;
  color: #fff;
  border-radius: 0.2rem;
  padding: 0.2rem 0.5rem;
  margin-bottom: 0;
}
</style>
