<template>
  <v-container>
    <v-card>
      <v-card-title>
        <!-- 所属校選択 -->
        <v-col cols="2">
          <v-select
            v-model="school_id"
            :items="schools"
            item-text="school_name"
            item-value="id"
            label="所属校"
            hide-details
            max-width="290px"
            min-width="290px"
          ></v-select>
        </v-col>
        <!-- 日付選択 -->
        <v-col cols="3">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :close-on-click="false"
            :return-value.sync="yearMonthDay"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="yearMonthDay"
                prepend-inner-icon="mdi-calendar"
                readonly
                v-on="on"
                hide-details
              />
            </template>
            <v-date-picker
              v-model="yearMonthDay"
              color="green"
              locale="ja-jp"
              :day-format="(date) => new Date(date).getDate()"
              no-title
              scrollable
            >
              <v-spacer />
              <v-btn text color="grey" @click="menu = false">キャンセル</v-btn>
              <v-btn text color="primary" @click="onSelectMonth">選択</v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
        <!-- 検索フォーム -->
        <v-col cols="3" sm="3">
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
          <v-btn dark color="green" @click="onClickAdd()"> 出欠記録作成 </v-btn>
        </v-col>
      </v-card-title>

      <!-- テーブル -->
      <v-data-table
        class="text-no-wrap"
        :headers="tableHeaders"
        :items="attendanceData"
        :footer-props="footerProps"
        :search="search"
        :loading="loading"
        :sort-by="'user_name'"
        :sort-desc="false"
        :items-per-page="30"
        mobile-breakpoint="0"
      >
        <!-- 開始時刻 -->
        <template #item.start="{ item }">
          {{ item.start }}
        </template>
        <!-- 終了時刻 -->
        <template #item.end="{ item }">
          {{ item.end }}
        </template>
        <!-- 食事提供加算 -->
        <template #item.food_fg="{ item }">
          <v-icon>{{ changeIcon(item.food_fg) }}</v-icon>
        </template>
        <!-- 施設外支援 -->
        <template #item.outside_fg="{ item }">
          <v-icon>{{ changeIcon(item.outside_fg) }}</v-icon>
        </template>
        <!-- 医療連携体制加算 -->
        <template #item.medical_fg="{ item }">
          <v-icon>{{ changeIcon(item.medical_fg) }}</v-icon>
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
import EditDialog from '../components/AttendanceEditDialog.vue'
import DeleteDialog from '../components/AttendanceDeleteDialog.vue'
import common from '../plugins/common.js'
import axios from 'axios'
import { mapState } from 'vuex'
export default {
  name: 'Attendance',

  components: {
    EditDialog,
    DeleteDialog,
  },

  data() {
    return {
      /** ローディング状態 */
      loading: false,
      /** 日付選択メニューの状態 */
      menu: false,
      /** 所属校選択 */
      school_id: 1,
      /** 選択年月 */
      yearMonthDay: common.getYearMonthDay(),
      /** 検索文字 */
      search: '',
      /** 出欠記録データ */
      attendanceData: [],
    }
  },

  watch: {
    /** 所属校を変更時に出欠記録テーブルを更新 */
    school_id: function () {
      this.updateTable()
    },
  },

  created() {
    /** 所属校と日付から出欠管理記録を取得 */
    this.updateTable()
  },

  computed: {
    /** settingモジュールからstateを呼び出し */
    ...mapState('setting', ['schools']),
    /** テーブルのヘッダー設定 */
    tableHeaders() {
      return [
        { text: '利用者', value: 'user_name' },
        { text: '開始時刻', value: 'start' },
        { text: '終了時刻', value: 'end' },
        { text: '食事提供加算', value: 'food_fg', align: 'center', sortable: false },
        { text: '施設外支援', value: 'outside_fg', align: 'center', sortable: false },
        {
          text: '医療連携体制加算',
          value: 'medical_fg',
          align: 'center',
          sortable: false,
        },
        { text: '備考', value: 'note' },
        { text: '操作', value: 'actions', sortable: false },
      ]
    },
    /** テーブルのフッター設定 */
    footerProps() {
      return { itemsPerPageText: '', itemsPerPageOptions: [] }
    },
  },

  methods: {
    /** 出欠記録テーブルを更新 */
    async updateTable() {
      this.loading = true
      await this.getAtData()
      this.loading = false
    },
    /** 出欠記録をAPIから取得 */
    async getAtData() {
      return await axios
        .get('api/attendances' + `?school_id=${this.school_id}&date=${this.yearMonthDay}`)
        .then((response) => {
          this.attendanceData = response.data.data.map((data) => {
            let attribute = data.data.attribute
            return attribute
          })
        })
        .catch(() => {
          this.attendanceData = []
        })
    },
    /** 登録／更新／削除がクリックされたとき */
    async onClickAction() {
      this.loading = true
      await this.updateTable()
      this.loading = false
    },
    /** 月選択ボタンがクリックされたとき */
    onSelectMonth() {
      /** menu内で選択された値を親コンポーネントに返却 */
      this.$refs.menu.save(this.yearMonthDay)
      this.updateTable()
    },
    /** boolean値をチェックアイコンに置換 */
    changeIcon(num) {
      return num ? 'mdi-check-bold' : null
    },
    /** 出欠記録作成ボタンがクリックされたとき */
    onClickAdd() {
      this.$refs.editDialog.open('add', {})
    },
    /** 編集ボタンがクリックされたとき */
    onClickEdit(item) {
      this.$refs.editDialog.open('edit', item)
    },
    /** 削除ボタンがクリックされたとき */
    onClickDelete(item) {
      this.$refs.deleteDialog.open(item)
    },
    /** モーダルスクロールを上部に移動 */
    scrollTop() {
      document.getElementById('scroll-target').scrollTop = 0
    },
  },
}
</script>
