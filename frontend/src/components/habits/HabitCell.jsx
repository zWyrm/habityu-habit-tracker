import { Td, Box, Icon } from '@chakra-ui/react'
import MeasurablePopover from './MeasurablePopover'
import { CheckIcon, CloseIcon } from '@chakra-ui/icons'

const HabitCell = ({ habit, date, entry, onToggle, onLogEntry }) => {

  const handleClick = () => {
    if (habit.type === 'simple') {
      onToggle(habit, date, entry)
    }
  }

  return (
    <Td p={6} textAlign="center"  onClick={handleClick}>
      {habit.type === 'simple' ? (
        <SimpleHabitToggle
          entry={entry}
          color={habit.color}
        />
      ) : (
        <MeasurablePopover
          habit={habit}
          entry={entry}
          date={date}
          onLogEntry={onLogEntry}
          color={habit.color}
        />
      )}
    </Td>
  )
}

const SimpleHabitToggle = ({ entry, color }) => {
  const isDone = entry && entry.value === 1
  let bg = 'gray.100'
  let iconColor = 'gray.400'
  let icon = CloseIcon

  if (isDone) {
      bg = color + '20'
      iconColor = color
      icon = CheckIcon
  }

  return (
    <Box
      w="40px"
      h="40px"
      borderRadius="md"
      bg={bg}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      transition="all 0.2s"
      _hover={{ transform: 'scale(1.1)' }}
    >
      <Icon as={icon} color={iconColor} />
    </Box>
  )
}

export default HabitCell