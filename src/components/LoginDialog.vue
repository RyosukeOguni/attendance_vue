<template>
  <!-- データ追加／編集ダイアログ -->
  <v-dialog v-model="show" scrollable persistent max-width="500px" eager>
    <v-card>
      <v-card-title>ログイン</v-card-title>
      <v-divider />
      <v-card-text class="mt-5">
        <v-form ref="form" v-model="valid">
          <!-- タイトル -->
          <v-text-field label="アカウント" v-model="account" :rules="accountRules" />
          <!-- メモ -->
          <v-text-field label="パスワード" v-model="password" :rules="passwordRule" />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey darken-1" text :disabled="loading" @click="onClickClose">
          キャンセル
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          :disabled="!valid"
          :loading="loading"
          @click="onClickAction"
        >
          ログイン
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'LoginDialog',

  data() {
    return {
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,

      /** アカウント */
      account: '',
      /** パスワード */
      password: '',

      /** バリデーションルール */
      accountRules: [
        (v) => v.trim().length > 0 || 'アカウントは必須です',
        (v) => v.length <= 20 || '20文字以内で入力してください',
      ],
      passwordRule: [
        (v) => v.trim().length > 0 || 'パスワードは必須です',
        (v) => v.length <= 8 || '8文字以内で入力してください',
      ],
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
    ...mapActions('auth', ['login']),

    /**
     * ダイアログを表示します。
     * このメソッドは親から呼び出されます。
     */
    open() {
      this.show = true
      this.resetForm()
    },
    /** キャンセルがクリックされたとき */
    onClickClose() {
      this.show = false
    },
    /** ログインがクリックされたとき */
    async onClickAction() {
      const login_date = {
        account: this.account,
        password: this.password,
      }
      await this.login(login_date)
      if (this.isAuth) {
        this.show = false
      }
    },
    /** フォームの内容を初期化します */
    resetForm() {
      this.account = ''
      this.password = ''
      this.$refs.form.resetValidation()
    },
  },
}
</script>
