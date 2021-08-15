/** 本日の年月日を取得 */
const getYearMonthDay = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = ('0' + (today.getMonth() + 1)).slice(-2)
  const day = ('0' + today.getDate()).slice(-2)
  return `${year}-${month}-${day}`
}

/**  */
const changeYearMonthDay = (today) => {
  const year = today.getFullYear()
  const month = ('0' + (today.getMonth() + 1)).slice(-2)
  const day = ('0' + today.getDate()).slice(-2)
  return `${year}-${month}-${day}`
}

const getYearMonth = (yearMonth) => {
  const date = yearMonth.split('-')
  return new Date(date[0], date[1] - 1, 1)
}
const getLastDay = (yearMonth) => {
  const date = yearMonth.split('-')
  return new Date(date[0], date[1], 0).getDate()
}

function set2fig(num) {
  // 桁数が1桁だったら先頭に0を加えて2桁に調整する
  let ret
  if (num < 10) {
    ret = '0' + num
  } else {
    ret = num
  }
  return ret
}

function showClock(cb) {
  let nowTime = new Date()
  let nowHour = set2fig(nowTime.getHours())
  let nowMin = set2fig(nowTime.getMinutes())
  let nowSec = set2fig(nowTime.getSeconds())
  let timer = nowHour + ':' + nowMin + ':' + nowSec
  cb(timer)
}
// setInterval('showClock2()', 1000)

export default {
  getYearMonthDay,
  changeYearMonthDay,
  getYearMonth,
  getLastDay,
  showClock,
}
