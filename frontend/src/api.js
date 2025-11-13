import axios from 'axios'
import { formatISO } from 'date-fns'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
})

const getStartDate = (daysAgo) => {
  return formatISO(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000), {
    representation: 'date',
  })
}

const getEndDate = () => {
  return formatISO(new Date(), { representation: 'date' })
}



export const fetchQuote = () => apiClient.get('/quote')

export const fetchSidebarWeekInsights = () =>
  apiClient.get('/insights/overall/week')

export const fetchSidebarCalendarInsights = (startDate, endDate) => {
  const params = {
    start_date: formatISO(startDate, { representation: 'date' }),
    end_date: formatISO(endDate, { representation: 'date' }),
  }
  return apiClient.get('/insights/overall/calendar', { params })
}

export const fetchHabitGrid = () => {
  const params = {
    start_date: getStartDate(6),
    end_date: getEndDate(),
  }
  return apiClient.get('/habits/grid', { params })
}

export const logHabitEntry = (data) => apiClient.post('/entry', data)

export const createHabit = (data) => apiClient.post('/habits', data)

export const updateHabit = (habitId, data) => apiClient.put(`/habits/${habitId}`, data)

export const deleteHabit = (habitId) => apiClient.delete(`/habits/${habitId}`)

export const fetchHabitStats = (habitId) => apiClient.get(`/insights/${habitId}/stats`)

export const fetchHabitChart = (habitId, view, startDate, endDate) => {
  const params = {
    chart_view: view,
    start_date: formatISO(startDate, { representation: 'date' }),
    end_date: formatISO(endDate, { representation: 'date' }),
  }
  return apiClient.get(`/insights/${habitId}/chart`, { params })
}

export const fetchHabitHeatmap = (habitId, startDate, endDate) => {
  const params = {
    start_date: formatISO(startDate, { representation: 'date' }),
    end_date: formatISO(endDate, { representation: 'date' }),
  }
  return apiClient.get(`/insights/${habitId}/heatmap`, { params })
}

export const exportPdfReport = () => {
  return apiClient.get('/export/pdf', {
    responseType: 'blob',
  })
}

