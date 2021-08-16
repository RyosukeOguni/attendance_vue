/** 本日の年月日を文字列で出力 */
const getYearMonthDay = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = ('0' + (today.getMonth() + 1)).slice(-2)
  const day = ('0' + today.getDate()).slice(-2)
  return `${year}-${month}-${day}`
}
/** 引数のDateオブジェクトを年月日の文字列で出力 */
const changeYearMonthDay = (today) => {
  const year = today.getFullYear()
  const month = ('0' + (today.getMonth() + 1)).slice(-2)
  const day = ('0' + today.getDate()).slice(-2)
  return `${year}-${month}-${day}`
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

export default {
  getYearMonthDay,
  changeYearMonthDay,
  getYearMonth,
  getLastDay,
  showClock,
}
