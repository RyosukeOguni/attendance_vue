<template>
  <!-- 削除ダイアログ -->
  <v-dialog v-model="show" persistent max-width="290">
    <v-card>
      <v-card-title />
      <v-card-text
        >[{{ item.year_month }}-{{ item.user_name ? item.user_name : item.school_name }}]
        を出力しますか？
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" text :disabled="loading" @click="onClickClose"
          >キャンセル</v-btn
        >
        <v-btn color="red" text :loading="loading" @click="onClickOutput">出力</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import axios from 'axios'
export default {
  name: 'OutputDialog',

  data() {
    return {
      /** ローディング状態 */
      loading: false,
      /** ダイアログの表示状態 */
      show: false,
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'individual',
      /** 受け取ったデータ */
      item: {},
    }
  },

  methods: {
    /** ダイアログを表示（親から呼び出し） */
    open(actionType, item) {
      this.show = true
      this.actionType = actionType
      this.item = { ...item }
    },
    /** キャンセルがクリックされたとき */
    onClickClose() {
      this.show = false
    },
    /** 削除がクリックされたとき */
    async onClickOutput() {
      this.loading = true
      await this.outputAbExcel(this.item)
      this.loading = false
      this.show = false
    },
    /** Excelファイルを出力 */
    async outputAbExcel(item) {
      if (this.actionType === 'individual') {
        try {
          const { data } = await axios.post('api/outputs/individual', item, {
            responseType: 'arraybuffer',
            headers: { Accept: 'application/vnd.ms-excel' },
          })
          const blob = new Blob([data], { type: 'application/vnd.ms-excel' })
          const uri = URL.createObjectURL(blob)
          let link = document.createElement('a')
          link.download = `${item.year_month}-${item.user_id}-${item.user_name}.xlsx`
          link.href = uri
          link.click()
        } catch (error) {
          alert('downloadに失敗しました')
        }
      } else {
        try {
          const { data } = await axios.post('api/outputs/bulk', item, {
            responseType: 'arraybuffer',
            headers: { Accept: 'application/zip' },
          })
          const blob = new Blob([data], { type: 'application/zip' })
          const uri = URL.createObjectURL(blob)
          let link = document.createElement('a')
          link.download = `${item.year_month}-${item.school_name}.zip`
          link.href = uri
          link.click()
        } catch (error) {
          alert('downloadに失敗しました')
        }
      }
    },
  },
}
</script>
