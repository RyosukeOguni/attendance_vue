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
          <v-list-item v-for="(school, i) in schools" :key="i">
            <v-list-item-icon>
              <v-icon>mdi-school</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ school.school_name }}</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="!isAuth">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title @click="onClickLogin">ログイン</v-list-item-title>
          </v-list-item>
          <v-list-item v-else>
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title @click="onClickLogout">ログアウト</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
    <!-- 追加／編集ダイアログ -->
    <LoginDialog ref="loginDialog" />
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import LoginDialog from './components/LoginDialog.vue'

export default {
  name: 'App',
  components: {
    LoginDialog,
  },
  // naviの状態
  data: () => ({
    drawer: false,
    group: null,
  }),
  // settingモジュールからstateを呼び出し
  computed: {
    ...mapState('setting', ['schools']),
    ...mapState('auth', ['isAuth']),
  },
  created() {
    this.getSchools()
  },
  // settingモジュールからactionを呼び出し
  methods: {
    ...mapActions('setting', ['getSchools']),
    /** ログインメニューがクリックされたとき */
    onClickLogin() {
      this.$refs.loginDialog.open()
    },
  },
}
</script>
