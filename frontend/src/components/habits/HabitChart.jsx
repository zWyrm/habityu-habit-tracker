import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Skeleton,
  Text,
  Select,
  Spacer,
} from '@chakra-ui/react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { fetchHabitChart } from '../../api'
import {
  startOfMonth,
  endOfMonth,
  format,
  startOfYear,
  endOfYear,
} from 'date-fns'

const HabitChart = ({ habit }) => {
  const [chartData, setChartData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState('weekly')

  useEffect(() => {
    const loadChart = async () => {
      setIsLoading(true)
      setChartData(null)

      const today = new Date()

      let range = {}
      if (view === 'weekly') {
        range = {
          start: startOfMonth(today),
          end: endOfMonth(today),
        }
      } else {
        range = {
          start: startOfYear(today),
          end: endOfYear(today),
        }
      }

      try {
        const response = await fetchHabitChart(
          habit.id,
          view,
          range.start,
          range.end,
        )
        setChartData(response.data.data)
      } catch (error) {
        console.error('Failed to load chart', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadChart()
  }, [habit, view])

  const getPeriodSubtext = () => {
    const today = new Date()
    const year = format(today, 'yyyy')
    const monthYear = format(today, 'MMMM yyyy')

    if (view === 'monthly') {
      return `Year ${year}`
    }
    return `${monthYear}`
  }

  return (
    <VStack align="stretch" spacing={4}>
      <HStack>
        <VStack align="flex-start" spacing={-1}>
          <Heading size="md">Completion Rate</Heading>
          <Text fontSize="sm" color="gray.500">
            {getPeriodSubtext()}
          </Text>
        </VStack>
        <Spacer />
        <Select
          value={view}
          onChange={(e) => setView(e.target.value)}
          w="120px"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>
      </HStack>
      <Skeleton isLoaded={!isLoading} height="250px" borderRadius="md">
        {chartData && chartData.length > 0 ? (
          <Box height="250px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ff9800"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box
            height="250px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="gray.500">No data for this period.</Text>
          </Box>
        )}
      </Skeleton>
    </VStack>
  )
}

export default HabitChart