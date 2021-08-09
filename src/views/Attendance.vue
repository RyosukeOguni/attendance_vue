<template>
  <div>
    <v-card>
      <v-card-title>
        <!-- 所属校選択 -->
        <v-col cols="4">
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
        <v-col cols="4">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :return-value.sync="yearMonthDay"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="yearMonthDay"
                prepend-icon="mdi-calendar"
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
        <v-spacer />

        <!-- 追加ボタン -->
        <v-col class="text-right" cols="4">
          <v-btn dark color="green"> 出欠記録作成 </v-btn>
        </v-col>
      </v-card-title>

      <!-- テーブル -->
      <v-data-table
        class="text-no-wrap"
        :headers="tableHeaders"
        :items="attendanceData"
        :footer-props="footerProps"
        :loading="loading"
        :sort-by="'date'"
        :sort-desc="true"
        :items-per-page="30"
        mobile-breakpoint="0"
      >
        <!-- 開始時刻 -->
        <template #item.start="{ item }">
          {{ changeTime(item.start) }}
        </template>
        <!-- 終了時刻 -->
        <template #item.end="{ item }">
          {{ changeTime(item.end) }}
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
  </div>
</template>

<script>
import EditDialog from '../components/EditDialog.vue'
import DeleteDialog from '../components/DeleteDialog.vue'
import axios from 'axios'
import { mapState } from 'vuex'
export default {
  name: 'Attendance',
  comments: {
    EditDialog,
    DeleteDialog,
  },
  data() {
    const today = new Date()
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + today.getDate()).slice(-2)

    return {
      /** ローディング状態 */
      loading: false,
      /** 日付選択メニューの状態 */
      menu: false,
      /** 所属校選択 */
      school_id: 1,
      /** 選択年月 */
      yearMonthDay: `${year}-${month}-${day}`,
      /** 出欠記録データ */
      attendanceData: [],
    }
  },
  // 所属校セレクトを変更時に出欠記録テーブルを更新
  watch: {
    school_id: function () {
      this.updateTable()
    },
  },
  // ページ読込時に出欠記録テーブルを更新
  mounted() {
    this.updateTable()
  },
  computed: {
    // モジュールからstateを呼び出し
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
      await this.getAttendance()
      this.loading = false
    },

    // 出欠記録をAPIから取得
    async getAttendance() {
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

    /** 月選択ボタンがクリックされたとき */
    onSelectMonth() {
      // menuで選択された値を親コンポーネントに返却
      this.$refs.menu.save(this.yearMonthDay)
      this.updateTable()
    },

    /** boolean値をチェックアイコンに置換 */
    changeIcon(num) {
      return num ? 'mdi-check-bold' : null
    },
    /** 時刻の末尾":00"を削除 */
    changeTime(num) {
      return num.slice(0, 5)
    },
    /** 追加ボタンがクリックされたとき */
    onClickAdd() {
      this.$refs.EditDialog.open('add')
    },
    /** 編集ボタンがクリックされたとき */
    onClickEdit(item) {
      this.$refs.EditDialog.open('edit', item)
    },
    // 削除ボタンがクリックされたとき
    onClickDelete(item) {
      this.$refs.DeleteDialog.open(item)
    },
  },
}
</script>
