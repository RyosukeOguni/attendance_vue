<template>
  <v-app>
    <v-app-bar color="blue darken-2" dark app flat dense>
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-subtitle-1">出欠管理システム</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list nav dense>
        <v-progress-linear
          :active="loading"
          :indeterminate="loading"
          color="orange accent-1"
          height="20"
          ><span style="color: orange">所属校読込中...</span>
        </v-progress-linear>
        <!-- 所属校分のリンクを表示 -->
        <v-list-item
          v-for="school in schools"
          :key="school.id"
          link
          :to="'/stamp/' + school.id"
        >
          <v-list-item-icon>
            <v-icon>mdi-office-building</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ school.school_name }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="!isAuth" link @click="onClickLogin">
          <v-list-item-icon>
            <v-icon>mdi-login</v-icon>
          </v-list-item-icon>
          <v-list-item-title>ログイン</v-list-item-title>
        </v-list-item>
        <div v-else>
          <v-list-item link to="/attendance">
            <v-list-item-icon>
              <v-icon>mdi-timetable</v-icon>
            </v-list-item-icon>
            <v-list-item-title>出欠記録管理</v-list-item-title>
          </v-list-item>
          <v-list-item link to="/output">
            <v-list-item-icon>
              <v-icon>mdi-printer</v-icon>
            </v-list-item-icon>
            <v-list-item-title>出欠記録出力</v-list-item-title>
          </v-list-item>
          <v-list-item link to="/user">
            <v-list-item-icon>
              <v-icon>mdi-account-details</v-icon>
            </v-list-item-icon>
            <v-list-item-title>利用者管理</v-list-item-title>
          </v-list-item>
          <v-list-item link @click="onClickLogout">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>ログアウト</v-list-item-title>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <!-- <v-container> -->
      <router-view />
      <!-- </v-container> -->
    </v-main>
    <!-- ログインダイアログ -->
    <LoginDialog ref="loginDialog" />
    <!-- ログインダイアログ -->
    <LogoutDialog ref="logoutDialog" />
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import LoginDialog from './components/LoginDialog.vue'
import LogoutDialog from './components/LogoutDialog.vue'

export default {
  name: 'App',
  components: {
    LoginDialog,
    LogoutDialog,
  },
  // naviの状態
  data: () => ({
    drawer: false,
    group: null,
  }),
  computed: {
    /** モジュールからstateを呼び出し */
    ...mapState('setting', ['schools', 'loading']),
    ...mapState('auth', ['isAuth']),
  },
  created() {
    this.getSettings()
  },
  methods: {
    /** モジュールからactionを呼び出し */
    ...mapActions('setting', ['getSettings']),
    /** ログインメニューがクリックされたとき */
    onClickLogin() {
      this.$refs.loginDialog.open()
    },
    /** ログインメニューがクリックされたとき */
    onClickLogout() {
      this.$refs.logoutDialog.open()
    },
  },
}
</script>
<style>
.v-toolbar__content {
  border-bottom: #fff solid 1px;
}
main {
  background-color: #1976d2;
  color: #ffffff;
}
</style>
