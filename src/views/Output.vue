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
        <v-col cols="2">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :close-on-click="false"
            :return-value.sync="yearMonth"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="yearMonth"
                prepend-inner-icon="mdi-calendar"
                readonly
                v-on="on"
                hide-details
              />
            </template>
            <v-date-picker
              v-model="yearMonth"
              type="month"
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
        <!-- 利用者 -->
        <v-col cols="3" sm="3">
          <v-select
            v-model="user_id"
            :items="userListSelect(school_id)"
            item-text="name"
            item-value="id"
            label="利用者"
            no-data-text="所属校を選択して下さい"
            hide-details
          ></v-select>
        </v-col>
        <v-spacer />
        <!-- 所属校一括出力ボタン -->
        <v-col class="text-right" cols="2">
          <v-btn dark block color="warning" @click="onClickBulk()">一括出力</v-btn>
        </v-col>
        <!-- 利用者個別出力ボタン -->
        <v-col v-if="!!user_id" class="text-right" cols="2">
          <v-btn dark block color="green" @click="onClickOutput()">個別出力</v-btn>
        </v-col>
      </v-card-title>

      <!-- テーブル -->
      <v-data-table
        class="text-no-wrap"
        :headers="tableHeaders"
        :items="attendanceData"
        :loading="loading"
        :sort-by="'user_name'"
        :sort-desc="false"
        :items-per-page="31"
        mobile-breakpoint="0"
        hide-default-footer
      >
        <!-- 日付 -->
        <template #item.insert_date="{ item }">
          {{ changeYearMonthDayWeek(item.insert_date) }}
        </template>
        <!-- 開始時刻 -->
        <template #item.start="{ item }">
          {{ item.attribute.start }}
        </template>
        <!-- 終了時刻 -->
        <template #item.end="{ item }">
          {{ item.attribute.end }}
        </template>
        <!-- 食事提供加算 -->
        <template #item.food_fg="{ item }">
          <v-icon>{{ changeIcon(item.attribute.food_fg) }}</v-icon>
        </template>
        <!-- 施設外支援 -->
        <template #item.outside_fg="{ item }">
          <v-icon>{{ changeIcon(item.attribute.outside_fg) }}</v-icon>
        </template>
        <!-- 医療連携体制加算 -->
        <template #item.medical_fg="{ item }">
          <v-icon>{{ changeIcon(item.attribute.medical_fg) }}</v-icon>
        </template>
        <!-- 備考 -->
        <template #item.note="{ item }">
          {{ item.attribute.note }}
        </template>
        <!-- 操作列 -->
        <template v-slot:item.actions="{ item }">
          <div v-if="!!Object.keys(item.attribute).length">
            <v-icon class="mr-2" @click="onClickEdit(item)">mdi-pencil</v-icon>
            <v-icon @click="onClickDelete(item)">mdi-delete</v-icon>
          </div>
          <v-icon v-else @click="onClickAdd(item)">mdi-plus-box-outline</v-icon>
        </template>
      </v-data-table>
    </v-card>
    <!-- 追加／編集ダイアログ -->
    <EditDialog ref="editDialog" @onClickAction="onClickAction" @scrollTop="scrollTop" />
    <!-- 削除ダイアログ -->
    <DeleteDialog ref="deleteDialog" @onClickAction="onClickAction" />
    <!-- 出力ダイアログ -->
    <OutputDialog ref="outputDialog" @onClickAction="onClickAction" />
  </v-container>
</template>

<script>
import EditDialog from '../components/AttendanceEditDialog.vue'
import DeleteDialog from '../components/AttendanceDeleteDialog.vue'
import OutputDialog from '../components/OutputDialog.vue'
import common from '../plugins/common.js'
import axios from 'axios'
import { mapState } from 'vuex'
export default {
  name: 'Output',

  components: {
    EditDialog,
    DeleteDialog,
    OutputDialog,
  },

  data() {
    return {
      /** ローディング状態 */
      loading: false,
      /** 日付選択メニューの状態 */
      menu: false,
      /** 所属校選択 */
      school_id: 1,
      /** 利用者選択 */
      user_id: null,
      /** 選択年月 */
      yearMonth: common.getYearMonthDay().substr(0, 7),
      /** 利用者リスト */
      usersList: [],
      /** 出欠記録データ */
      attendanceData: [],
    }
  },
  watch: {
    /** 所属校変更時に利用者をリセット */
    school_id: {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.user_id = null
        }
      },
    },
    /** 利用者変更時に出欠記録テーブルを更新 */
    user_id: {
      handler(newValue) {
        if (newValue === null) {
          /** 変更後がnullの場合、出欠記録を空にする */
          this.attendanceData = []
        } else {
          /** 別の利用者に変更時、出欠記録を取得 */
          this.updateTable()
        }
      },
    },
  },

  created() {
    /** 利用者リストを取得 */
    this.getUsers()
  },

  computed: {
    ...mapState('setting', ['schools']),
    /** 所属校で利用者を出し分け（引数で結果を返すcomputed） */
    userListSelect: function () {
      return function (school_id) {
        return this.usersList.filter((data) => data.school_id === school_id)
      }
    },
    /** テーブルのヘッダー設定 */
    tableHeaders() {
      return [
        // { text: '利用者', value: 'user_name' },
        { text: '日付', value: 'insert_date' },
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
      const toMonth = common.getYearMonth(this.yearMonth)
      const lastDay = common.getLastDay(this.yearMonth)
      this.attendanceData = []
      for (let i = 0; i < lastDay; i++) {
        /** 出欠記録をAPIから取得 */
        let today = new Date(toMonth.getTime())
        this.attendanceData = [
          ...this.attendanceData,
          { insert_date: today, attribute: {} },
        ]
        toMonth.setDate(toMonth.getDate() + 1)
      }
      return await axios
        .get('api/attendances' + `?user_id=${this.user_id}&year_month=${this.yearMonth}`)
        .then((response) => {
          let attribute = response.data.data.map((data) => {
            return data.data.attribute
          })
          this.attendanceData = this.attendanceData.map((d) => {
            attribute.forEach((e) => {
              if (e.insert_date == common.changeYearMonthDay(d.insert_date)) {
                d.attribute = e
              }
            })
            return d
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
      this.$refs.menu.save(this.yearMonth)
      if (this.user_id !== null) {
        this.updateTable()
      }
    },
    /** 利用者リストをAPIから取得 */
    async getUsers() {
      return await axios
        .get('api/users')
        .then((response) => {
          this.usersList = response.data.data.map((data) => {
            let attribute = data.data.attribute
            return attribute
          })
        })
        .catch(() => {
          this.attendanceData = []
        })
    },
    changeYearMonthDayWeek(today) {
      return common.changeYearMonthDayWeek(today)
    },
    /** boolean値をチェックアイコンに置換 */
    changeIcon(num) {
      return num ? 'mdi-check-bold' : null
    },
    /** 出欠記録作成ボタンがクリックされたとき */
    onClickAdd(item) {
      item = { ...item, school_id: this.school_id, user_id: this.user_id }
      item.insert_date = common.changeYearMonthDay(item.insert_date)
      this.$refs.editDialog.open('add', item)
    },
    /** 編集ボタンがクリックされたとき */
    onClickEdit(item) {
      this.$refs.editDialog.open('edit', item.attribute)
    },
    /** 削除ボタンがクリックされたとき */
    onClickDelete(item) {
      this.$refs.deleteDialog.open(item.attribute)
    },
    /** 所属校一括出力ボタンがクリックされたとき */
    onClickBulk() {
      this.$refs.outputDialog.open('bulk', {
        school_id: this.school_id,
        year_month: this.yearMonth,
        school_name: this.schools.find((data) => data.id == this.school_id).school_name,
      })
    },
    /** 利用者個別出力ボタンがクリックされたとき */
    onClickOutput() {
      this.$refs.outputDialog.open('individual', {
        user_id: this.user_id,
        year_month: this.yearMonth,
        user_name: this.usersList.find((data) => data.id == this.user_id).name,
      })
    },
    /** モーダルスクロールを上部に移動 */
    scrollTop() {
      document.getElementById('scroll-target').scrollTop = 0
    },
  },
}
</script>
