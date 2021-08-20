<template>
  <!-- 削除ダイアログ -->
  <v-dialog v-model="show" persistent max-width="290">
    <v-card>
      <v-card-title />
      <v-card-text class="black--text"> ログアウトしますか？ </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" text :disabled="loading" @click="onClickClose"
          >キャンセル</v-btn
        >
        <v-btn color="red" text :loading="loading" @click="onClickLogout"
          >ログアウト</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'LogoutDialog',

  data() {
    return {
      /** ダイアログの表示状態 */
      show: false,
    }
  },

  computed: {
    ...mapState('auth', {
      /** ローディング状態 */
      loading: (state) => state.loading,
      isAuth: (state) => state.isAuth,
    }),
  },

  methods: {
    ...mapActions('auth', ['logout']),
    /** ダイアログを表示（親から呼び出し） */
    open() {
      this.show = true
    },
    /** キャンセルがクリックされたとき */
    onClickClose() {
      this.show = false
    },
    /** ログアウトがクリックされたとき */
    async onClickLogout() {
      await this.logout()
      if (!this.isAuth) {
        this.show = false
        this.$router.replace({ path: '/' })
      }
    },
  },
}
</script>
