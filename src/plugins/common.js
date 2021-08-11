/** 本日の年月日を取得 */
const getYearMonthDay = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = ('0' + (today.getMonth() + 1)).slice(-2)
  const day = ('0' + today.getDate()).slice(-2)
  return `${year}-${month}-${day}`
}

export default {
  getYearMonthDay,
}
