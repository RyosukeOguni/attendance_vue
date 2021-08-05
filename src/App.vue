<template>
  <v-app>
    <v-app-bar color="blue darken-2" dark app>
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>

      <v-toolbar-title>出欠管理システム</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-list nav dense>
        <v-list-item-group
          v-model="group"
          active-class="deep-purple--text text--accent-4"
        >
          <!-- 所属校分のリンクを表示 -->
          <v-list-item v-for="(school, i) in schools" :key="i">
            <v-list-item-icon>
              <v-icon>mdi-school</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ school.school_name }}</v-list-item-title>
          </v-list-item>
          <div v-if="!isAuth">
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-login</v-icon>
              </v-list-item-icon>
              <v-list-item-title @click="onClickLogin">ログイン</v-list-item-title>
            </v-list-item>
          </div>
          <div v-else>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-database</v-icon>
              </v-list-item-icon>
              <v-list-item-title>出欠管理</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-account-details</v-icon>
              </v-list-item-icon>
              <v-list-item-title>利用者管理</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-title @click="onClickLogout">ログアウト</v-list-item-title>
            </v-list-item>
          </div>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
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
    // モジュールからstateを呼び出し
    ...mapState('setting', ['schools']),
    ...mapState('auth', ['isAuth']),
  },
  created() {
    this.getSchools()
  },
  methods: {
    // モジュールからactionを呼び出し
    ...mapActions('setting', ['getSchools']),
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
