import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react'
import EditHabitTab from './EditHabitTab'
import StatsTab from './StatsTab'

const HabitDetailsDrawer = ({
  isOpen,
  onClose,
  habit,
  onHabitUpdated,
  onHabitDeleted,
}) => {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">{habit.name}</DrawerHeader>
        <DrawerBody p={0}>
          <Tabs isFitted colorScheme="orange">
            <TabList>
              <Tab>Stats</Tab>
              <Tab>Edit</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <StatsTab habit={habit} isDrawerOpen={isOpen}/>
              </TabPanel>
              <TabPanel>
                <EditHabitTab
                  habit={habit}
                  onHabitUpdated={onHabitUpdated}
                  onHabitDeleted={onHabitDeleted}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default HabitDetailsDrawer