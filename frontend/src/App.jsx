import { useState } from 'react'
import {
  Box,
  Grid,
  GridItem,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import HabitGrid from './components/habits/HabitGrid'
import NewHabitDrawer from './components/habits/NewHabitDrawer'
import HabitDetailsDrawer from './components/habits/HabitDetailsDrawer'

function App() {
  const [refreshAllData, setRefreshAllData] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)

  const {
    isOpen: isMobileNavOpen,
    onOpen: onMobileNavOpen,
    onClose: onMobileNavClose,
  } = useDisclosure()
  const {
    isOpen: isNewHabitOpen,
    onOpen: onNewHabitOpen,
    onClose: onNewHabitClose,
  } = useDisclosure()
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure()

  const handleHabitCreated = () => {
    setRefreshAllData((prev) => !prev)
    onNewHabitClose()
  }

  const handleHabitUpdated = () => {
    setRefreshAllData((prev) => !prev)
    onDetailsClose()
  }

  const handleHabitDeleted = () => {
    setRefreshAllData((prev) => !prev)
    onDetailsClose()
  }

  const handleLogEntry = () => {
    setRefreshAllData((prev) => !prev)
  }

  const handleSelectHabit = (habit) => {
    setSelectedHabit(habit)
    onDetailsOpen()
  }

  return (
    <Box>
      <Header onMobileNavOpen={onMobileNavOpen} />

      <Grid
        templateColumns={{ base: '1fr', md: '320px 1fr' }}
        height="calc(100vh - 64px)"
      >
        <GridItem
          display={{ base: 'none', md: 'block' }}
          overflowY="auto"
          p={6}
          borderRight="1px"
          borderColor="gray.200"
        >
          <Sidebar refreshSignal={refreshAllData} />
        </GridItem>

        <GridItem overflowY="auto" p={6}>
          <HabitGrid
            onNewHabitOpen={onNewHabitOpen}
            onSelectHabit={handleSelectHabit}
            refreshGrid={refreshAllData}
            onLogEntry={handleLogEntry}
          />
        </GridItem>
      </Grid>

      <Drawer
        isOpen={isMobileNavOpen}
        placement="left"
        onClose={onMobileNavClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Habityu</DrawerHeader>
          <DrawerBody>
            <Sidebar refreshSignal={refreshAllData} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <NewHabitDrawer
        isOpen={isNewHabitOpen}
        onClose={onNewHabitClose}
        onHabitCreated={handleHabitCreated}
      />

      {selectedHabit && (
        <HabitDetailsDrawer
          isOpen={isDetailsOpen}
          onClose={onDetailsClose}
          habit={selectedHabit}
          onHabitUpdated={handleHabitUpdated}
          onHabitDeleted={handleHabitDeleted}
        />
      )}
    </Box>
  )
}

export default App