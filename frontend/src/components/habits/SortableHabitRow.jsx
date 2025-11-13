import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Tr, Td, IconButton } from '@chakra-ui/react'
import { GoGrabber } from 'react-icons/go'
import HabitCell from './HabitCell'

const SortableHabitRow = ({
  habit,
  days,
  findEntry,
  onSelectHabit,
  onToggle,
  onLogEntry,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: habit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Tr ref={setNodeRef} style={style} {...attributes}>
      <Td p={2} w="10px" textAlign="center">
        <IconButton
          icon={<GoGrabber />}
          variant="ghost"
          cursor="grab"
          size="sm"
          {...listeners}
        />
      </Td>
      <Td
        p={6}
        fontWeight="bold"
        cursor="pointer"
        _hover={{ bg: 'gray.50' }}
        onClick={() => onSelectHabit(habit)}
        color={habit.color}
      >
        {habit.name}
      </Td>
      {days.map((day) => {
        const entry = findEntry(habit, day)
        return (
          <HabitCell
            key={day.toISOString()}
            habit={habit}
            date={day}
            entry={entry}
            onToggle={onToggle}
            onLogEntry={onLogEntry}
          />
        )
      })}
    </Tr>
  )
}

export default SortableHabitRow