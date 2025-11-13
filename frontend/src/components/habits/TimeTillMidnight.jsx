import { useState, useEffect } from 'react'
import { Text } from '@chakra-ui/react'
import { differenceInMilliseconds, endOfDay } from 'date-fns'

const TimeTillMidnight = () => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const midnight = endOfDay(now)
      const diff = differenceInMilliseconds(midnight, now)

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeLeft(`${hours} hrs ${minutes} mins till midnight`)
      } else {
        setTimeLeft(`${minutes} mins till midnight`)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <Text fontSize="md" color="gray.500">
      {timeLeft}
    </Text>
  )
}

export default TimeTillMidnight