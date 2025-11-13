import { VStack } from '@chakra-ui/react'
import Greeting from '../InsightSidebar/Greeting.jsx'
import QuoteBlock from '../InsightSidebar/QuoteBlock'
import StreakStats from '../InsightSidebar/StreakStats'
import InsightsCalendar from '../InsightSidebar/InsightsCalendar'

const Sidebar = ({ refreshSignal }) => {
  return (
    <VStack spacing={8} align="stretch">
      <Greeting />
      <QuoteBlock />
      <StreakStats refreshSignal={refreshSignal} />
      <InsightsCalendar refreshSignal={refreshSignal} />
    </VStack>
  )
}

export default Sidebar