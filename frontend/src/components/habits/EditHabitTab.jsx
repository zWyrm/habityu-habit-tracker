import { useState } from 'react'
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  HStack,
  NumberInput,
  NumberInputField,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Text,
} from '@chakra-ui/react'
import { updateHabit, deleteHabit } from '../../api'
import { FaCheck, FaTrash } from 'react-icons/fa'
import React from 'react'
import ColorPickerInput from './ColorPickerInput'

const EditHabitTab = ({ habit, onHabitUpdated, onHabitDeleted }) => {
  const DEFAULT_COLOR = '#1677FF'
  const [name, setName] = useState(habit.name)
  const [color, setColor] = useState(habit.color || DEFAULT_COLOR)
  const [target, setTarget] = useState(habit.target || 10)
  const [unit, setUnit] = useState(habit.unit || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()

  const isConfirmationMatch = deleteConfirmation === habit.name

  const handleClose = () => {
    setDeleteConfirmation('');
    onClose();
  }

  const handleSubmit = async () => {
    setIsSaving(true)

    const finalColor = color === '' ? DEFAULT_COLOR : color

    const data = {
      name,
      color: finalColor,
      type: habit.type,
      target: habit.type === 'measurable' ? target : null,
      unit: habit.type === 'measurable' ? unit : null,
    }
    try {
      await updateHabit(habit.id, data)
      onHabitUpdated()
    } catch (error) {
      console.error('Failed to update habit', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteHabit(habit.id)
      onHabitDeleted()
      onClose()
    } catch (error) {
      console.error('Failed to delete habit', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <VStack spacing={6} p={4}>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormControl>

        {habit.type === 'measurable' && (
          <HStack spacing={4} w="full">
            <FormControl isRequired flex={1}>
              <FormLabel>Target</FormLabel>
              <NumberInput value={target} onChange={(v) => setTarget(v)} min={1}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl flex={1}>
              <FormLabel>Unit</FormLabel>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
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

        <HStack w="full" justify="space-between" pt={4}>
          <Button
            colorScheme="red"
            variant="outline"
            leftIcon={<FaTrash />}
            onClick={onOpen}
          >
            Delete
          </Button>
          <Button
            colorScheme="orange"
            leftIcon={<FaCheck />}
            isLoading={isSaving}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </HStack>
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Habit     Deletion
            </AlertDialogHeader>
            <AlertDialogBody>
              <VStack spacing={4} align="stretch">
                <Text>
                  By deleting a habit, you also delete all the historic logs and insights of that habit, if you understand and wish to continue, type "
                  <Text as="span" fontWeight="bold" color="red.500">
                    {habit.name}
                  </Text>
                  " below.
                </Text>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={habit.name}
                />
              </VStack>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                isLoading={isDeleting}
                ml={3}
                isDisabled={!isConfirmationMatch}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default EditHabitTab