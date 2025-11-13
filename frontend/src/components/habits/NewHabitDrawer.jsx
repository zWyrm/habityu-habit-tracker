import { useState } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Box,
  Heading,
  Text,
  SimpleGrid,
  useRadioGroup,
  useRadio,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react'
import { createHabit } from '../../api'
import { FaCheck } from 'react-icons/fa'
import ColorPickerInput from './ColorPickerInput'

const HabitTypeCard = (props) => {
  const { getInputProps, getRadioProps } = useRadio(props)
  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        p={5}
        _checked={{
          bg: 'orange.500',
          color: 'white',
          borderColor: 'orange.500',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
      >
        {props.children}
      </Box>
    </Box>
  )
}

const NewHabitDrawer = ({ isOpen, onClose, onHabitCreated }) => {
  const DEFAULT_COLOR = '#1677FF'
  const [step, setStep] = useState(1)
  const [type, setType] = useState('simple')
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [target, setTarget] = useState(10)
  const [unit, setUnit] = useState('times')
  const [isLoading, setIsLoading] = useState(false)

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'habitType',
    defaultValue: 'simple',
    onChange: setType,
  })
  const group = getRootProps()

  const resetForm = () => {
    setStep(1)
    setType('simple')
    setName('')
    setColor(DEFAULT_COLOR)
    setTarget(10)
    setUnit('times')
    setIsLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    const finalColor = color === '' ? DEFAULT_COLOR : color

    const data = {
      name,
      color: finalColor,
      type,
      target: type === 'measurable' ? target : null,
      unit: type === 'measurable' ? unit : null,
    }
    try {
      await createHabit(data)
      resetForm()
      onHabitCreated()
    } catch (error) {
      console.error('Failed to create habit', error)
      setIsLoading(false)
    }
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          {step === 1 ? 'Start a New Habit' : 'Create Your Habit'}
        </DrawerHeader>

        <DrawerBody>
          {step === 1 && (
            <VStack spacing={4} {...group}>
              <Text>What kind of habit would you like to start?</Text>
              <SimpleGrid columns={2} spacing={4} w="full">
                <HabitTypeCard {...getRadioProps({ value: 'simple' })}>
                  <Heading size="md">Simple</Heading>
                  <Text>A yes/no habit (e.g., Meditate)</Text>
                </HabitTypeCard>
                <HabitTypeCard {...getRadioProps({ value: 'measurable' })}>
                  <Heading size="md">Measurable</Heading>
                  <Text>A habit with a goal (e.g., Drink 8 glasses of water)</Text>
                </HabitTypeCard>
              </SimpleGrid>
            </VStack>
          )}
          {step === 2 && (
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Drink Water"
                />
              </FormControl>

              {type === 'measurable' && (
                <HStack spacing={4} w="full">
                  <FormControl isRequired flex={1}>
                    <FormLabel>Target</FormLabel>
                    <NumberInput value={target} onChange={(v) => setTarget(v)} min={1}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl flex={1}>
                    <FormLabel>Unit</FormLabel>
                    <Input
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g., glasses, km, pages"
                    />
                  </FormControl>
                </HStack>
              )}

              <FormControl>
                <FormLabel>Color</FormLabel>
                <ColorPickerInput
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </FormControl>
            </VStack>
          )}
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          {step === 1 && (
            <Button colorScheme="orange" onClick={() => setStep(2)}>
              Next
            </Button>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" mr={3} onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                colorScheme="orange"
                onClick={handleSubmit}
                isLoading={isLoading}
                leftIcon={<FaCheck />}
                isDisabled={!name}
              >
                Create Habit
              </Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default NewHabitDrawer