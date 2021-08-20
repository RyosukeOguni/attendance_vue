<template>
  <!-- 削除ダイアログ -->
  <v-dialog v-model="show" persistent max-width="290">
    <v-card>
      <v-card-title />
      <v-card-text class="black--text">
        [{{ item.insert_date }}-{{ item.user_name }}] を削除しますか？
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" text :disabled="loading" @click="onClickClose"
          >キャンセル</v-btn
        >
        <v-btn color="red" text :loading="loading" @click="onClickDelete">削除</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import axios from 'axios'
export default {
  name: 'AttendanceDeleteDialog',

  data() {
    return {
      /** ローディング状態 */
      loading: false,
      /** ダイアログの表示状態 */
      show: false,
      /** 受け取ったデータ */
      item: {},
    }
  },

  methods: {
    /** ダイアログを表示（親から呼び出し） */
    open(item) {
      this.show = true
      this.item = item
    },
    /** キャンセルがクリックされたとき */
    onClickClose() {
      this.show = false
    },
    /** 削除がクリックされたとき */
    async onClickDelete() {
      this.loading = true
      await this.deleteAbData(this.item)
      await this.$emit('onClickAction')
      this.loading = false
      this.show = false
    },
    /** 出欠記録削除 */
    async deleteAbData(item) {
      return await axios
        .delete('api/attendances/' + item.id)
        .then(() => {
          this.item = {}
        })
        .catch(() => {
          this.item = {}
        })
    },
  },
}
</script>
