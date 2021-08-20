<template>
  <!-- データ追加／編集ダイアログ -->
  <v-dialog v-model="show" scrollable persistent max-width="500px" eager>
    <v-card>
      <v-card-title>{{ titleText }}</v-card-title>
      <v-divider />
      <!-- スクロールリセットのidを指定 -->
      <v-card-text id="scroll-target" class="pt-5">
        <v-form ref="form" v-model="valid">
          <!-- 利用者名 -->
          <v-text-field
            label="利用者名"
            v-model="item.name"
            :counter="20"
            :rules="userNameRule"
          />
          <!-- カナ名 -->
          <v-text-field
            label="カナ名"
            v-model="item.name_kana"
            :counter="20"
            :rules="userNameKanaRule"
          />
          <!-- 所属校 -->
          <v-select
            v-model="item.school_id"
            :items="schools"
            item-text="school_name"
            item-value="id"
            label="所属校"
            :rules="[schoolIdRule]"
          ></v-select>
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
          {{ actionText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
export default {
  name: 'UserEditDialog',

  data() {
    return {
      /** ローディング状態 */
      loading: false,
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'add',
      /** 利用者データ */
      item: this.setItemDate(),
      /** バリデーションルール */
      userNameRule: [
        (v) => v.trim().length > 0 || '利用者名を入力して下さい',
        (v) => v.length <= 20 || '20文字以内で入力してください',
      ],
      userNameKanaRule: [
        (v) => v.trim().length > 0 || 'カナ名を入力して下さい',
        (v) => v.length <= 20 || '20文字以内で入力してください',
      ],
      schoolIdRule: (v) => !!v || '所属校を選択して下さい',
    }
  },

  computed: {
    ...mapState('setting', ['schools']),
    /** ダイアログのタイトル */
    titleText() {
      return this.actionType === 'add' ? '利用者登録' : '利用者更新'
    },
    /** ダイアログのアクション */
    actionText() {
      return this.actionType === 'add' ? '登録' : '更新'
    },
  },

  methods: {
    /** ダイアログを表示（親から呼び出し） */
    open(actionType, item) {
      this.show = true
      this.actionType = actionType
      if (actionType === 'edit') {
        this.item = { ...item }
        delete this.item.user_name
        delete this.item.note
      }
    },
    /** キャンセルがクリックされたとき */
    onClickClose() {
      this.show = false
      this.resetForm()
      this.$emit('scrollTop')
    },
    /** 登録／更新がクリックされたとき */
    async onClickAction() {
      this.loading = true
      if (this.actionType === 'add') {
        /** 登録の場合 */
        await this.addAtData(this.item)
      } else {
        /** 更新の場合 */
        await this.updateAtData(this.item)
      }
      this.loading = false
      this.show = false
      this.resetForm()
      this.$emit('scrollTop')
    },
    /** 利用者登録 */
    async addAtData(item) {
      let json = { ...item }
      return await axios
        .post('api/users', json)
        .then((response) => {
          let attribute = response.data.data.attribute
          this.$emit('onClickAction', { actionType: this.actionType, item: attribute })
        })
        .catch(() => {})
    },
    /** 利用者更新 */
    async updateAtData(item) {
      let json = { ...item }
      delete json.id
      return await axios
        .put(`api/users/${item.id}`, json)
        .then((response) => {
          let attribute = response.data.data.attribute
          this.$emit('onClickAction', { actionType: this.actionType, item: attribute })
        })
        .catch(() => {})
    },
    /** 利用者オブジェクトを生成 */
    setItemDate() {
      return {
        /** 利用者名 */
        name: '',
        /** カナ名 */
        name_kana: '',
        /** 所属校ID */
        school_id: null,
      }
    },
    /** フォームの内容を初期化 */
    resetForm() {
      this.item = this.setItemDate()
      this.$refs.form.resetValidation()
    },
  },
}
</script>
