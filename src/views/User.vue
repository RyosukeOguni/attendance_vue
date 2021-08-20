<template>
  <v-container>
    <v-card>
      <v-card-title>
        <!-- 所属校選択 -->
        <v-col cols="3">
          <v-select
            v-model="school_id"
            :items="schoolList"
            item-text="school_name"
            item-value="id"
            label="所属校"
            hide-details
            max-width="290px"
            min-width="290px"
          ></v-select>
        </v-col>
        <!-- 検索フォーム -->
        <v-col cols="4" sm="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          />
        </v-col>
        <v-spacer />
        <!-- 追加ボタン -->
        <v-col class="text-right" cols="4">
          <v-btn dark color="green" @click="onClickAdd()">利用者登録</v-btn>
        </v-col>
      </v-card-title>

      <!-- テーブル -->
      <v-data-table
        class="text-no-wrap"
        :headers="tableHeaders"
        :items="userListSelect(school_id)"
        :footer-props="footerProps"
        :search="search"
        :loading="loading"
        :sort-by="'user_name'"
        :sort-desc="false"
        :items-per-page="30"
        mobile-breakpoint="0"
      >
        <!-- 登録日時 -->
        <template #item.created_at="{ item }">
          {{ changeDate(item.created_at) }}
        </template>
        <!-- 更新日時 -->
        <template #item.updated_at="{ item }">
          {{ changeDate(item.updated_at) }}
        </template>
        <!-- 操作列 -->
        <template v-slot:item.actions="{ item }">
          <v-icon class="mr-2" @click="onClickEdit(item)">mdi-pencil</v-icon>
          <v-icon @click="onClickDelete(item)">mdi-delete</v-icon>
        </template>
      </v-data-table>
    </v-card>
    <!-- 追加／編集ダイアログ -->
    <EditDialog ref="editDialog" @onClickAction="onClickAction" @scrollTop="scrollTop" />
    <!-- 削除ダイアログ -->
    <DeleteDialog ref="deleteDialog" @onClickAction="onClickAction" />
  </v-container>
</template>

<script>
import EditDialog from '../components/UserEditDialog.vue'
import DeleteDialog from '../components/UserDeleteDialog.vue'
import axios from 'axios'
import { mapState } from 'vuex'
export default {
  name: 'User',

  components: {
    EditDialog,
    DeleteDialog,
  },

  data() {
    return {
      /** ローディング状態 */
      loading: false,
      /** 所属校選択 */
      school_id: 0,
      /** 検索文字 */
      search: '',
      /** 利用者データ */
      usersData: [],
    }
  },

  created() {
    /** 所属校から利用者記録を取得 */
    this.updateTable()
  },

  computed: {
    /** settingモジュールからstateを呼び出し */
    ...mapState('setting', ['schools']),
    /** 所属校リストに'全ての所属校'を追加 */
    schoolList() {
      return [
        {
          id: 0,
          school_name: '全ての所属校',
        },
        ...this.schools,
      ]
    },
    /** 所属校で利用者を出し分け（引数で結果を返すcomputed） */
    userListSelect: function () {
      return function (school_id) {
        if (school_id === 0) {
          return this.usersData
        } else {
          return this.usersData.filter((data) => data.school_id === school_id)
        }
      }
    },
    /** テーブルのヘッダー設定 */
    tableHeaders() {
      return [
        { text: 'ID', value: 'id' },
        { text: '利用者名', value: 'name' },
        { text: 'カナ名', value: 'name_kana' },
        { text: '所属校', value: 'school_name' },
        { text: '登録日時', value: 'created_at' },
        { text: '更新日時', value: 'updated_at' },
        { text: '操作', value: 'actions', sortable: false },
      ]
    },
    /** テーブルのフッター設定 */
    footerProps() {
      return { itemsPerPageText: '', itemsPerPageOptions: [] }
    },
  },

  methods: {
    /** 利用者テーブルを更新 */
    async updateTable() {
      this.loading = true
      await this.getAtData()
      this.loading = false
    },
    /** 利用者をAPIから取得 */
    async getAtData() {
      return await axios
        .get('api/users')
        .then((response) => {
          this.usersData = response.data.data.map((data) => {
            let attribute = data.data.attribute
            return attribute
          })
        })
        .catch(() => {
          this.usersData = []
        })
    },
    /** 登録／更新／削除がクリックされたとき */
    async onClickAction() {
      this.loading = true
      await this.updateTable()
      this.loading = false
    },
    /** timestamp型をYYYY-mm-ddに変換 */
    changeDate(timestamp) {
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = ('0' + (date.getMonth() + 1)).slice(-2)
      const day = ('0' + date.getDate()).slice(-2)
      return `${year}-${month}-${day}`
    },
    /** 利用者登録ボタンがクリックされたとき */
    onClickAdd() {
      this.$refs.editDialog.open('add')
    },
    /** 編集ボタンがクリックされたとき */
    onClickEdit(item) {
      this.$refs.editDialog.open('edit', item)
    },
    /** 削除ボタンがクリックされたとき */
    onClickDelete(item) {
      this.$refs.deleteDialog.open(item)
    },
    // 進行ボタンが押される度にモーダルスクロールを上部に移動
    scrollTop() {
      document.getElementById('scroll-target').scrollTop = 0
    },
  },
}
</script>
