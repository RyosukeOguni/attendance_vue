<template>
  <!-- データ追加／編集ダイアログ -->
  <v-dialog v-model="show" scrollable persistent max-width="500px" eager>
    <v-card>
      <v-card-title>{{ titleText }}</v-card-title>
      <v-divider />
      <!-- スクロールリセットのidを指定 -->
      <v-card-text id="scroll-target">
        <v-form ref="form" v-model="valid">
          <!-- 日付選択 -->
          <v-menu
            ref="menu_date"
            v-model="menu_date"
            :close-on-content-click="false"
            :close-on-click="false"
            :return-value.sync="item.insert_date"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="item.insert_date"
                prepend-inner-icon="mdi-calendar"
                readonly
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="item.insert_date"
              color="green"
              locale="ja-jp"
              :day-format="(date) => new Date(date).getDate()"
              no-title
              scrollable
            >
              <v-spacer />
              <v-btn text color="grey" @click="menu_date = false">キャンセル</v-btn>
              <v-btn text color="primary" @click="$refs.menu_date.save(item.insert_date)"
                >選択</v-btn
              >
            </v-date-picker>
          </v-menu>
          <!-- 所属校 -->
          <v-select
            v-model="item.school_id"
            :items="schools"
            item-text="school_name"
            item-value="id"
            label="所属校"
            :rules="[schoolIdRule]"
          ></v-select>
          <!-- 利用者 -->
          <v-select
            v-model="item.user_id"
            :items="userListSelect(item.school_id)"
            item-text="name"
            item-value="id"
            label="利用者"
            :rules="[userIdRule]"
            no-data-text="所属校を選択して下さい"
          ></v-select>
          <!-- 備考 -->
          <v-select
            v-model="item.note_id"
            :items="notes"
            item-text="note"
            item-value="id"
            label="備考"
            :rules="[noteIdRule]"
          ></v-select>
          <!-- 開始時間 -->
          <v-dialog
            ref="start"
            v-model="menu_start"
            :return-value.sync="item.start"
            persistent
            width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="item.start"
                prepend-inner-icon="mdi-clock-outline"
                label="開始時間"
                readonly
                v-on="on"
              />
            </template>

            <v-time-picker
              v-if="menu_start"
              v-model="item.start"
              :max="item.end"
              :allowed-hours="allowedHours"
              :allowed-minutes="allowedStep"
              format="24hr"
              scrollable
            >
              <v-spacer />
              <v-btn text color="grey" @click="menu_start = false">キャンセル</v-btn>
              <v-btn text color="primary" @click="$refs.start.save(item.start)"
                >選択</v-btn
              >
            </v-time-picker>
          </v-dialog>

          <!-- 終了時間 -->
          <v-dialog
            ref="end"
            v-model="menu_end"
            :return-value.sync="item.end"
            persistent
            width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="item.end"
                prepend-inner-icon="mdi-clock-outline"
                label="終了時間"
                readonly
                v-on="on"
              />
            </template>
            <v-time-picker
              v-if="menu_end"
              v-model="item.end"
              :min="item.start"
              max="16:00"
              :allowed-hours="allowedHours"
              :allowed-minutes="allowedStep"
              format="24hr"
            >
              <v-spacer />
              <v-btn text color="grey" @click="menu_end = false">キャンセル</v-btn>
              <v-btn text color="primary" @click="$refs.end.save(item.end)">選択</v-btn>
            </v-time-picker>
          </v-dialog>

          <!-- 食事提供加算 -->
          <v-checkbox
            v-model="item.food_fg"
            label="食事提供加算"
            color="primary"
            :value="item.food_fg"
          ></v-checkbox>
          <!-- 施設外支援フラグ -->
          <v-checkbox
            v-model="item.outside_fg"
            label="施設外支援フラグ"
            color="primary"
            :value="item.outside_fg"
          ></v-checkbox>
          <!-- 医療連携体制加算フラグ -->
          <v-checkbox
            v-model="item.medical_fg"
            label="医療連携体制加算フラグ"
            color="primary"
            :value="item.medical_fg"
          ></v-checkbox>
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
import common from '../plugins/common.js'
import { mapState } from 'vuex'
export default {
  name: 'AttendanceEditDialog',

  data() {
    return {
      /** ローディング状態 */
      loading: false,
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 日付選択メニューの表示状態 */
      menu_date: false,
      /** 開始時間メニューの表示状態 */
      menu_start: false,
      /** 終了時間メニューの表示状態 */
      menu_end: false,
      /** 利用者リスト */
      usersList: [],
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'add',
      /** 出欠記録データ */
      item: this.setItemDate(),
      /** バリデーションルール */
      userIdRule: (v) => !!v || '利用者を選択して下さい',
      schoolIdRule: (v) => !!v || '所属校を選択して下さい',
      noteIdRule: (v) => !!v || '備考を選択して下さい',
    }
  },

  computed: {
    ...mapState('setting', ['schools', 'notes']),
    /** ダイアログのタイトル */
    titleText() {
      return this.actionType === 'add' ? '出欠記録作成' : '出欠記録更新'
    },
    /** ダイアログのアクション */
    actionText() {
      return this.actionType === 'add' ? '作成' : '更新'
    },
    /** 所属校で利用者を出し分け（引数で結果を返すcomputed） */
    userListSelect: function () {
      return function (school_id) {
        return this.usersList.filter((data) => data.school_id === school_id)
      }
    },
  },

  watch: {
    /** 所属校セレクトを変更時に出欠記録テーブルを更新 */
    'item.school_id': {
      handler(newValue, oldValue) {
        if (newValue !== oldValue && oldValue !== null) {
          this.item.user_id = null
        }
      },
    },
  },

  created() {
    /** ダイアログ表示時に利用者リストを読込 */
    this.getUsers()
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
      if ('attribute' in item) {
        this.item.insert_date = item.insert_date
        this.item.school_id = item.school_id
        this.item.user_id = item.user_id
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
    /** 出欠記録登録 */
    async addAtData(item) {
      let json = { ...item }
      delete json.school_id
      return await axios
        .post('api/attendances', json)
        .then((response) => {
          let attribute = response.data.data.attribute
          this.$emit('onClickAction', { actionType: this.actionType, item: attribute })
        })
        .catch(() => {})
    },
    /** 出欠記録更新 */
    async updateAtData(item) {
      let json = { ...item }
      delete json.id
      delete json.school_id
      return await axios
        .put(`api/attendances/${item.id}`, json)
        .then((response) => {
          let attribute = response.data.data.attribute
          this.$emit('onClickAction', { actionType: this.actionType, item: attribute })
        })
        .catch(() => {})
    },
    /** 出欠記録オブジェクトを生成 */
    setItemDate() {
      return {
        /** 日付 */
        insert_date: common.getYearMonthDay(),
        /** 利用者ID */
        user_id: null,
        /** 所属校ID */
        school_id: null,
        /** 備考ID */
        note_id: null,
        /** 開始時間 */
        start: '10:00',
        /** 終了時間 */
        end: '16:00',
        /** 食事提供加算 */
        food_fg: false,
        /** 施設外支援フラグ */
        outside_fg: false,
        /** 医療連携体制加算フラグ */
        medical_fg: false,
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
    /** フォームの内容を初期化 */
    resetForm() {
      this.item = this.setItemDate()
      this.$refs.form.resetValidation()
    },
    /** 時刻設定:時間の範囲 */
    allowedHours: (v) => v >= 10 && v <= 16,
    /** 時刻設定:15分間隔 */
    allowedStep: (m) => m % 15 === 0,
  },
}
</script>
