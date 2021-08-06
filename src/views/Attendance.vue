<template>
  <div>
    <v-card>
      <v-card-title>
        <!-- 所属校選択 -->
        <v-col cols="4">
          <v-select
            v-model="school"
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
              <v-btn text color="primary" @click="$refs.menu.save(yearMonthDay)"
                >選択</v-btn
              >
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
        :items="tableData"
        :search="search"
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
import { mapState, mapActions } from 'vuex'
export default {
  name: 'Attendance',

  data() {
    const today = new Date()
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDay() + 1)).slice(-2)

    return {
      /** ローディング状態 */
      loading: false,
      /** 日付選択メニューの状態 */
      menu: false,
      /** 検索文字 */
      school: {},
      /** 選択年月 */
      yearMonthDay: `${year}-${month}-${day}`,
      /** テーブルに表示させるデータ */
      tableData: [
        /** サンプルデータ */
        {
          id: 5,
          user_id: 5,
          school_id: 2,
          note_id: 3,
          user_name: 'ムラヤマ カオリ',
          note: 'メール',
          insert_date: '2021-07-01',
          start: '11:45:00',
          end: '14:15:00',
          food_fg: 0,
          outside_fg: 1,
          medical_fg: 1,
        },
        {
          id: 12,
          user_id: 12,
          school_id: 2,
          note_id: 1,
          user_name: 'ナカムラ ヨウイチ',
          note: '通所',
          insert_date: '2021-07-01',
          start: '11:30:00',
          end: '15:30:00',
          food_fg: 0,
          outside_fg: 1,
          medical_fg: 0,
        },
      ],
    }
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
        { text: '備考', value: 'note', sortable: false },
        { text: '操作', value: 'actions', sortable: false },
      ]
    },

    /** テーブルのフッター設定 */
    footerProps() {
      return { itemsPerPageText: '', itemsPerPageOptions: [] }
    },
  },
  methods: {
    ...mapActions('attendance', ['getAttendances']),
    /** 表示させるデータを更新します */
    async updateTable() {
      const yearMonth = this.yearMonth
      const list = this.abData[yearMonth]

      if (list) {
        this.tableData = list
      } else {
        await this.fetchAbData({ yearMonth })
        this.tableData = this.abData[yearMonth]
      }
    },

    /** 月選択ボタンがクリックされたとき */
    onSelectMonth() {
      this.$refs.menu.save(this.yearMonth)
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
      this.$refs.itemDialog.open('add')
    },
    /** 編集ボタンがクリックされたとき */
    onClickEdit(item) {
      this.$refs.itemDialog.open('edit', item)
    },
    // 削除ボタンがクリックされたとき
    onClickDelete(item) {
      this.$refs.deleteDialog.open(item)
    },
  },
}
</script>
