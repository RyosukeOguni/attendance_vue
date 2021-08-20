/** 本日の年月日を文字列で出力 */
const getYearMonthDay = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = ('0' + (today.getMonth() + 1)).slice(-2)
  const day = ('0' + today.getDate()).slice(-2)
  return `${year}-${month}-${day}`
}
/** 引数のDateオブジェクトをYYYY-mm-dd文字列で出力 */
const changeYearMonthDay = (today) => {
  const year = today.getFullYear()
  const month = ('0' + (today.getMonth() + 1)).slice(-2)
  const day = ('0' + today.getDate()).slice(-2)
  return `${year}-${month}-${day}`
}
/** 引数のDateオブジェクトを年月日(曜日)の文字列で出力 */
const changeYearMonthDayWeek = (today) => {
  const year = today.getFullYear()
  const month = ('0' + (today.getMonth() + 1)).slice(-2)
  const day = ('0' + today.getDate()).slice(-2)
  const dayOfWeek = today.getDay()
  const dayOfWeekStr = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]
  return `${year}年${month}月${day}日(${dayOfWeekStr})`
}
/** 年月からDate型のオブジェクトを生成 */
const getYearMonth = (yearMonth) => {
  const date = yearMonth.split('-')
  return new Date(date[0], date[1] - 1, 1)
}
/** 年月から、その月の日数を算出 */
const getLastDay = (yearMonth) => {
  const date = yearMonth.split('-')
  return new Date(date[0], date[1], 0).getDate()
}
/** 桁数が1桁だったら先頭に0を加えて2桁に調整する */
function set2fig(num) {
  let ret
  if (num < 10) {
    ret = '0' + num
  } else {
    ret = num
  }
  return ret
}
/** 現在時刻を00:00:00で出力する（コールバック関数で処理） */
function showClock(cb) {
  let nowTime = new Date()
  let nowHour = set2fig(nowTime.getHours())
  let nowMin = set2fig(nowTime.getMinutes())
  let nowSec = set2fig(nowTime.getSeconds())
  let timer = nowHour + ':' + nowMin + ':' + nowSec
  cb(timer)
}
/** 時間を15分切り下げて取得 */
function getRoundUpTime(margin_minutes = 15) {
  let nowTime = new Date()
  let hour = nowTime.getHours()
  let minute = nowTime.getMinutes()
  /**
   * 10:00以前に打刻の場合、10:00に変更
   * 16:00以降に打刻の場合、16:00に変更
   */
  if (hour < 10) {
    return '10:00'
  } else if (hour >= 16) {
    return '16:00'
  }
  /** 分を15分単位で切り下げる */
  if (minute % margin_minutes) {
    minute += margin_minutes - (minute % margin_minutes)
    if (minute === 60) {
      minute = 0
      hour++
    }
  }
  return set2fig(hour) + ':' + set2fig(minute)
}

export default {
  getYearMonthDay,
  changeYearMonthDay,
  changeYearMonthDayWeek,
  getYearMonth,
  getLastDay,
  showClock,
  getRoundUpTime,
}
