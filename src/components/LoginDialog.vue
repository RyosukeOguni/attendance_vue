<template>
  <!-- データ追加／編集ダイアログ -->
  <v-dialog v-model="show" scrollable persistent max-width="500px" eager>
    <v-card>
      <v-card-title>ログイン</v-card-title>
      <v-divider />
      <v-card-text class="pt-5">
        <!-- <v-alert v-if="errorMessage" type="warning" dense>ログインに失敗しました</v-alert> -->
        <v-form ref="form" v-model="valid">
          <!-- タイトル -->
          <v-text-field
            label="アカウント"
            v-model="loginDate.account"
            :rules="accountRules"
          />
          <!-- メモ -->
          <v-text-field
            label="パスワード"
            v-model="loginDate.password"
            :rules="passwordRule"
          />
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
      loginDate: {
        /** アカウント */
        account: '',
        /** パスワード */
        password: '',
      },
      /** エラーメッセージ */
      error: false,
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,

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
    ...mapState('auth', ['loading', 'isAuth', 'errorMessage']),
  },

  // watch: {
  //   errorMessage() {
  //     this.error = true
  //   },
  // },

  methods: {
    ...mapActions('auth', ['login']),
    /** ダイアログを表示（親から呼び出し） */
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
      await this.login(this.loginDate)
      if (this.isAuth) {
        this.show = false
        this.$router.replace({ path: '/attendance' })
      }
    },
    /** フォームの内容を初期化 */
    resetForm() {
      this.loginDate = {
        account: '',
        password: '',
      }
      // this.errorMessage = false
      this.$refs.form.resetValidation()
    },
  },
}
</script>
