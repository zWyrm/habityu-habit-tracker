import { useState, useEffect } from 'react'
import {
  VStack,
  HStack,
  Heading,
  IconButton,
  Spacer,
  Skeleton,
  Box,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { fetchHabitHeatmap } from '../../api'
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  format,
} from 'date-fns'

const HabitHeatmap = ({ habit }) => {
  const [heatmapData, setHeatmapData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const loadHeatmap = async () => {
      setIsLoading(true)

      const range = {
        start: startOfMonth(subMonths(currentDate, 2)),
        end: endOfMonth(currentDate),
      }

      try {
        const response = await fetchHabitHeatmap(
          habit.id,
          range.start,
          range.end,
        )
        const formattedData = response.data.heatmap_data.map((d) => ({
          date: d.date,
          count: d.value,
        }))
        setHeatmapData({ data: formattedData, range: range })
      } catch (error) {
        console.error('Failed to load heatmap', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadHeatmap()
  }, [habit, currentDate])

  const prevMonth = () => setCurrentDate((d) => subMonths(d, 1))
  const nextMonth = () => setCurrentDate((d) => addMonths(d, 1))

  return (
    <VStack align="stretch" spacing={4}>
      <HStack>
        <Heading size="md">Daily Average Heatmap</Heading>
        <Spacer />
        <IconButton icon={<ChevronLeftIcon />} onClick={prevMonth} />
        <IconButton icon={<ChevronRightIcon />} onClick={nextMonth} />
      </HStack>
      <Skeleton isLoaded={!isLoading} height="180px" borderRadius="md">
        {heatmapData && (
          <Box>
            <CalendarHeatmap
              startDate={heatmapData.range.start}
              endDate={heatmapData.range.end}
              values={heatmapData.data}
              showMonthLabels={true}
              showWeekdayLabels={true}
              classForValue={(value) => {
                if (!value || value.count === 0) {
                  return 'color-empty'
                }
                if (value.count < 25) return 'color-scale-1'
                if (value.count < 50) return 'color-scale-2'
                if (value.count < 75) return 'color-scale-3'
                return 'color-scale-4'
              }}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) return null
                return {
                  'data-tip': `${format(new Date(value.date), 'MMMM d')}: ${
                    value.count || 0
                  }%`,
                }
              }}
            />
          </Box>
        )}
      </Skeleton>
    </VStack>
  )
}

export default HabitHeatmap