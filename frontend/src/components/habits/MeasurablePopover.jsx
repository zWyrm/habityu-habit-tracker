import { useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  CircularProgress,
  Box,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
} from '@chakra-ui/react'
import { logHabitEntry } from '../../api'
import { getIsoDate } from '../../utils/dates'

const MeasurablePopover = ({ habit, entry, date, isFuture, onLogEntry, color }) => {
  const [value, setValue] = useState(entry ? entry.value : 0)
  const [isLoading, setIsLoading] = useState(false)

  let percentage = 0
  if (entry && habit.target && habit.target > 0) {
    percentage = (entry.value / habit.target) * 100
  }

  const handleSave = async (onClose) => {
    if (isFuture) return
    setIsLoading(true)
    try {
      await logHabitEntry({
        habit_id: habit.id,
        date: getIsoDate(date),
        value: Number(value),
      })
      onLogEntry()
      onClose()
    } catch (error) {
      console.error('Failed to log entry', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover
      onOpen={() => setValue(entry ? entry.value : 0)}
      isLazy
    >
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Box as="button" _focus={{ outline: 'none' }}>
              <CircularProgress
                value={percentage}
                color={color}
                opacity={percentage >= 100 ? 1.0 : 0.6}
                trackColor={color + '30'}
                size="40px"
                thickness="10px"
              />
            </Box>
          </PopoverTrigger>

          <PopoverContent placement="auto">
            <PopoverArrow />
            <PopoverCloseButton />
            {!isFuture && (
              <PopoverHeader>Log {habit.name}</PopoverHeader>
            )}
            <PopoverBody>
              {!isFuture && (
                <Box>
                  <NumberInput
                    value={value}
                    onChange={(val) => setValue(val)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Button
                    mt={3}
                    colorScheme="orange"
                    onClick={() => handleSave(onClose)}
                    isLoading={isLoading}
                  >
                    Save
                  </Button>
                </Box>
              )}
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}

export default MeasurablePopover
