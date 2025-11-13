import { useState, useEffect } from 'react'
import {
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  Skeleton,
} from '@chakra-ui/react'
import { FaFire, FaMedal } from 'react-icons/fa'
import { CheckIcon, CloseIcon, MinusIcon } from '@chakra-ui/icons'
import { fetchSidebarWeekInsights } from '../../api'

const DayIcon = ({ status }) => {
  if (status === 'completed') {
    return (
      <Icon as={CheckIcon} color="green.500" w={5} h={5} p={1} borderRadius="full" bg="green.100" />
    )
  }
  if (status === 'missed') {
    return (
      <Icon as={CloseIcon} color="red.500" w={5} h={5} p={1} borderRadius="full" bg="red.100" />
    )
  }
  return <Icon as={MinusIcon} color="gray.400" w={5} h={5} p={1} borderRadius="full" bg="gray.100" />
}

const StreakStats = ({ refreshSignal }) => {
  const [insights, setInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInsights = async () => {
      setIsLoading(true)
      try {
        const response = await fetchSidebarWeekInsights()
        setInsights(response.data)
      } catch (error) {
        console.error('Failed to fetch streak insights', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadInsights()
  }, [refreshSignal])

  return (
    <Skeleton isLoaded={!isLoading} minH="120px" borderRadius="md">
      {insights && (
        <VStack spacing={4} align="stretch">
          <HStack spacing={4} align="flex-end" justify="space-between">
            <VStack align="flex-start" spacing={-1}>
              <HStack spacing={2} align="center">
                <Icon as={FaFire} color="orange.400" w={5} h={5} />
                <Heading size="lg">{insights.current_overall_streak}</Heading>
                <Text fontSize="lg" pt="2px">
                  day
                </Text>
              </HStack>
              <Text fontSize="md" color="gray.600" pl={1}>
                Current streak
              </Text>
            </VStack>

            {/* Column 2: Longest Streak (Unchanged) */}
            <VStack align="flex-end" spacing={-1}>
              <HStack spacing={2} align="center">
                <Icon as={FaMedal} color="yellow.500" w={5} h={5} />
                <Heading size="lg">{insights.longest_overall_streak}</Heading>
              </HStack>
              <Text fontSize="md" color="gray.600">
                Longest streak
              </Text>
            </VStack>
          </HStack>

          <HStack justify="space-between" p={2} bg="gray.50" borderRadius="md">
            {insights.current_week_stats.map((day) => (
              <VStack key={day.day}>
                <Text fontSize="sm" color="gray.500" textTransform="uppercase">
                  {day.day}
                </Text>
                <DayIcon status={day.status} />
              </VStack>
            ))}
          </HStack>
        </VStack>
      )}
    </Skeleton>
  )
}

export default StreakStats