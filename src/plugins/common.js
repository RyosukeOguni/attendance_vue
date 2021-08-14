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

export default {
  getYearMonthDay,
  changeYearMonthDay,
  getYearMonth,
  getLastDay,
}
