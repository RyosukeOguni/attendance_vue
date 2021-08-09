<template>
  <!-- データ追加／編集ダイアログ -->
  <v-dialog v-model="show" scrollable persistent max-width="500px" eager>
    <v-card>
      <v-card-title>{{ titleText }}</v-card-title>
      <v-divider />
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- 日付選択 -->
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :return-value.sync="item.insert_date"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="item.insert_date"
                prepend-icon="mdi-calendar"
                readonly
                v-on="on"
                hide-details
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
              <v-btn text color="grey" @click="menu = false">キャンセル</v-btn>
              <v-btn text color="primary" @click="$refs.menu.save(item.insert_date)"
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
            hide-details
          ></v-select>
          <!-- 利用者 -->
          <v-select
            v-model="item.user_id"
            :items="userListSelect(item.school_id)"
            item-text="name"
            item-value="id"
            label="利用者"
            hide-details
          ></v-select>
          <!-- 備考 -->
          <v-select
            v-model="item.note_id"
            :items="notes"
            item-text="note"
            item-value="id"
            label="備考"
            hide-details
          ></v-select>
          <!-- 開始時間 -->
          <v-time-picker
            v-model="item.start"
            format="24hr"
            landscape
            scrollable
          ></v-time-picker>
          <!-- 終了時間 -->
          <v-time-picker
            v-model="item.end"
            format="24hr"
            landscape
            scrollable
          ></v-time-picker>
          <!-- 食事提供加算 -->
          <v-checkbox
            v-model="item.food_fg"
            label="食事提供加算"
            color="primary"
            :value="item.food_fg"
            hide-details
          ></v-checkbox>
          <!-- 施設外支援フラグ -->
          <v-checkbox
            v-model="item.outside_fg"
            label="施設外支援フラグ"
            color="primary"
            :value="item.outside_fg"
            hide-details
          ></v-checkbox>
          <!-- 医療連携体制加算フラグ -->
          <v-checkbox
            v-model="item.medical_fg"
            label="医療連携体制加算フラグ"
            color="primary"
            :value="item.medical_fg"
            hide-details
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
import { mapState } from 'vuex'
const itemDate = () => ({
  /** id */
  id: '',
  /** 日付 */
  insert_date: '',
  /** 利用者ID */
  user_id: null,
  /** 所属校ID */
  school_id: null,
  /** 備考ID */
  note_id: null,
  /** 開始時間 */
  start: '',
  /** 終了時間 */
  end: '',
  /** 食事提供加算 */
  food_fg: false,
  /** 施設外支援フラグ */
  outside_fg: false,
  /** 医療連携体制加算フラグ */
  medical_fg: false,
})
export default {
  name: 'EditDialog',

  data() {
    return {
      /** ローディング状態 */
      loading: false,
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 日付選択メニューの表示状態 */
      menu: false,
      /** 利用者リスト */
      usersList: [],
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'add',
      /** 出欠記録データ */
      item: itemDate(),
      /** バリデーションルール */
      userIdRules: (v) => v || '利用者を選択して下さい',
      schoolIdRule: (v) => v || '所属校を選択して下さい',
      noteIdRule: (v) => v || '備考を選択して下さい',
    }
  },

  computed: {
    ...mapState('setting', ['schools', 'notes']),
    /** ダイアログのタイトル */
    titleText() {
      return this.actionType === 'add' ? 'データ追加' : 'データ編集'
    },
    /** ダイアログのアクション */
    actionText() {
      return this.actionType === 'add' ? '追加' : '更新'
    },
    userListSelect: function () {
      return function (school_id) {
        return this.usersList.filter((data) => data.school_id === school_id)
      }
    },
  },
  // 所属校セレクトを変更時に出欠記録テーブルを更新
  created() {
    this.getUsers()
  },
  methods: {
    /**
     * ダイアログを表示します。
     * このメソッドは親から呼び出されます。
     */
    open(actionType, item) {
      this.show = true
      this.actionType = actionType
      this.resetForm()

      if (actionType === 'edit') {
        this.item = { ...item }
        delete this.item.user_name
        delete this.item.note
      }
    },

    /** キャンセルがクリックされたとき */
    onClickClose() {
      this.show = false
    },

    /** 追加／更新がクリックされたとき */
    async onClickAction() {
      if (this.actionType === 'add') {
        //新規登録の場合
        await this.addAbData(this.item)
      } else {
        //更新の場合
        await this.updateAbData(this.item)
      }
      this.show = false
    },

    // 利用者リストをAPIから取得
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

    /** フォームの内容を初期化します */
    resetForm() {
      this.item = itemDate()
      this.$refs.form.resetValidation()
    },
  },
}
</script>
