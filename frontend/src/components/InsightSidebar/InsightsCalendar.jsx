    import { useState, useEffect } from 'react'
    import {
      Box,
      CircularProgress,
      Skeleton,
      HStack,
      Heading,
      Spacer,
      IconButton,
    } from '@chakra-ui/react'
    import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
    import Calendar from 'react-calendar'
    import { fetchSidebarCalendarInsights } from '../../api'
    import { getIsoDate } from '../../utils/dates'
    import {
      format,
      addMonths,
      subMonths,
      startOfMonth,
      endOfMonth,
    } from 'date-fns'

    const InsightsCalendar = ({ refreshSignal }) => {
      const [stats, setStats] = useState(null)
      const [isLoading, setIsLoading] = useState(true)
      const [activeDate, setActiveDate] = useState(new Date())

      useEffect(() => {
        const loadStats = async () => {
          setIsLoading(true)

          const startDate = startOfMonth(activeDate)
          const endDate = endOfMonth(activeDate)

          try {
            const response = await fetchSidebarCalendarInsights(startDate, endDate)
            const statsMap = new Map(
              response.data.calendar_stats.map((s) => [s.date, s]),
            )
            setStats({ map: statsMap })
          } catch (error) {
            console.error('Failed to fetch calendar insights', error)
          } finally {
            setIsLoading(false)
          }
        }
        loadStats()
      }, [refreshSignal, activeDate])

      const tileContent = ({ date, view }) => {
        if (view !== 'month' || !stats) return null

        const isoDate = getIsoDate(date)
        const dayStat = stats.map.get(isoDate)

        if (dayStat && dayStat.completed_percentage > 0) {
          let progressColor = 'gray.400'

          if (dayStat.completed_percentage >= 100) {
            progressColor = 'orange.400'
          }

          return (
            <Box
              position="absolute"
              inset={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <CircularProgress
                value={dayStat.completed_percentage}
                size="38px"
                color={progressColor}
                trackColor="transparent"
                thickness="6px"
              />
            </Box>
          )

        }

        return null
      }

      const prevMonth = () => setActiveDate(subMonths(activeDate, 1))
      const nextMonth = () => setActiveDate(addMonths(activeDate, 1))

      return (
        <Skeleton isLoaded={!isLoading} minH="300px" borderRadius="md">
          <HStack mb={2}>
            <Heading size="sm">{format(activeDate, 'MMMM yyyy')}</Heading>
            <Spacer />
            <IconButton
              icon={<ChevronLeftIcon />}
              size="sm"
              variant="ghost"
              onClick={prevMonth}
              aria-label="Previous month"
            />
            <IconButton
              icon={<ChevronRightIcon />}
              size="sm"
              variant="ghost"
              onClick={nextMonth}
              aria-label="Next month"
            />
          </HStack>

          <Box>
            <Calendar
              tileContent={tileContent}
              calendarType="gregory"
              view="month"
              activeStartDate={activeDate}
              onActiveStartDateChange={() => {}}
              showNavigation={false}
            />
          </Box>
        </Skeleton>
      )
    }

    export default InsightsCalendar