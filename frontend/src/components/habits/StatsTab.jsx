import { useState, useEffect } from 'react'
import {
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  List,
  ListItem,
  ListIcon,
  Text,
  Skeleton,
} from '@chakra-ui/react'
import { FaFire, FaMedal } from 'react-icons/fa'
import { fetchHabitStats } from '../../api'
import HabitChart from './HabitChart'
import HabitHeatmap from './HabitHeatmap'

const StatsTab = ({ habit }) => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!habit) return
      setIsLoading(true)
      try {
        const response = await fetchHabitStats(habit.id)
        setStats(response.data)
      } catch (error) {
        console.error('Failed to load stats', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [habit])

  return (
    <VStack spacing={8} p={4} align="stretch">
      <Skeleton isLoaded={!isLoading} minH="100px" borderRadius="md">
        {stats && (
          <HStack justify="space-around" spacing={4}>
            <Stat textAlign="center">
              <StatLabel>Total Completions</StatLabel>
              <StatNumber>{stats.total_completions}</StatNumber>
            </Stat>
            <List spacing={2}>
              <ListItem>
                <ListIcon as={FaFire} color="orange.400" />
                <Text as="span" fontWeight="bold">
                  {stats.current_streak} days
                </Text>{" "}
                current streak
              </ListItem>
              <ListItem>
                <ListIcon as={FaMedal} color="yellow.500" />
                <Text as="span" fontWeight="bold">
                  {stats.longest_streak} days
                </Text>{" "}
                longest streak
              </ListItem>
            </List>
          </HStack>
        )}
      </Skeleton>

      <HabitChart habit={habit} />
      <HabitHeatmap habit={habit} />
    </VStack>
  )
}

export default StatsTab