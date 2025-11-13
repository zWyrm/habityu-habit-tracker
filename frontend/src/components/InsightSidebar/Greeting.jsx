import { Heading, VStack } from '@chakra-ui/react'
import { format } from 'date-fns'

const Greeting = () => {
  const today = format(new Date(), 'eeee')
  return (
    <VStack spacing={0} align="stretch">
      <Heading size="lg">Happy</Heading>
      <Heading size="lg">{today}!</Heading>
    </VStack>
  )
}

export default Greeting