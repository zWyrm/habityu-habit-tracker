import { format, subDays, formatISO } from 'date-fns'

export const getPastSevenDays = () => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    days.push(subDays(today, i))
  }
  return days
}

export const getDayLabel = (date) => {
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const dateStr = format(date, 'yyyy-MM-dd')

  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return format(date, 'EEE')
}

export const getIsoDate = (date) => {
  return formatISO(date, { representation: 'date' })
}