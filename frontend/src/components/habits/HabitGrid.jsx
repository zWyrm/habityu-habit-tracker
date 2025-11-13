import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Button,
  Flex,
  Spacer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Text,
  Skeleton,
  VStack,
  IconButton,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { fetchHabitGrid, logHabitEntry } from '../../api'
import { getPastSevenDays, getDayLabel, getIsoDate } from '../../utils/dates'
import { format } from 'date-fns'
import TimeTillMidnight from './TimeTillMidnight'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import SortableHabitRow from './SortableHabitRow'

const HabitGrid = ({
  onNewHabitOpen,
  onSelectHabit,
  refreshGrid,
  onLogEntry,
}) => {
    const [habits, setHabits] = useState([])
  const [orderedHabits, setOrderedHabits] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [days, setDays] = useState([])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  useEffect(() => {
    const pastDays = getPastSevenDays()
    setDays(pastDays)
  }, [])

  useEffect(() => {
    const loadHabits = async () => {
      setIsLoading(true)
      try {
        const response = await fetchHabitGrid()
        setHabits(response.data)
        setOrderedHabits(response.data)
      } catch (error) {
        console.error('Failed to fetch habit grid', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadHabits()
  }, [refreshGrid])

  const findEntry = (habit, date) => {
    const isoDate = getIsoDate(date)
    return habit.entries.find((e) => e.date === isoDate)
  }

  const handleCellToggle = async (habit, date, entry) => {
    let newValue = 0
    if (habit.type === 'simple' && !entry) {
      newValue = 1
    }

    try {
      await logHabitEntry({
        habit_id: habit.id,
        date: getIsoDate(date),
        value: newValue,
      })
      onLogEntry()
    } catch (error) {
      console.error('Failed to log entry', error)
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setOrderedHabits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

          //! just frontend reorder, order not being saved in db yet
        const newOrder = arrayMove(items, oldIndex, newIndex)
        return newOrder
      })
    }
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Flex align="center">
        <VStack align="stretch" spacing={0}>
          <Heading size="lg">Let's check off some tasks, shall we?</Heading>
          <TimeTillMidnight />
        </VStack>
        <Spacer />
        <Button
          display={{ base: 'none', md: 'flex' }}
          leftIcon={<AddIcon />}
          colorScheme="orange"
          onClick={onNewHabitOpen}
        >
          New Habit
        </Button>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          icon={<AddIcon />}
          colorScheme="orange"
          onClick={onNewHabitOpen}
          aria-label="Add New Habit"
        />
      </Flex>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Box
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          overflow="hidden"
        >
          <Skeleton isLoaded={!isLoading} minH="400px">
            <Box overflowX="auto">
              <Table variant="simple" size="lg">
                <Thead>
                  <Tr>
                    <Th p={2} w="10px"></Th>
                    <Th minW="200px" p={6}>
                      Habit
                    </Th>
                    {days.map((day) => (
                      <Th key={day.toISOString()} p={6} textAlign="center">
                        <Text fontSize="md">{getDayLabel(day)}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {format(day, 'd')}
                        </Text>
                      </Th>
                    ))}
                  </Tr>
                </Thead>

                <SortableContext
                  items={orderedHabits.map((h) => h.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Tbody>
                    {orderedHabits.map((habit) => (
                      <SortableHabitRow
                        key={habit.id}
                        habit={habit}
                        days={days}
                        findEntry={findEntry}
                        onSelectHabit={onSelectHabit}
                        onToggle={handleCellToggle}
                        onLogEntry={onLogEntry}
                      />
                    ))}
                  </Tbody>
                </SortableContext>
              </Table>
            </Box>
          </Skeleton>
        </Box>
      </DndContext>
    </VStack>
  )
}

export default HabitGrid