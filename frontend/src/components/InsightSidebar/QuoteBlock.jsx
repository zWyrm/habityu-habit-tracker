import { useState, useEffect } from 'react'
import {
  Box,
  Text,
  IconButton,
  HStack,
  VStack,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  Button,
} from '@chakra-ui/react'
import { EditIcon, RepeatIcon } from '@chakra-ui/icons'
import { fetchQuote } from '../../api'

const QuoteBlock = () => {
  const [quote, setQuote] = useState({
    quote: 'Success is the sum of small efforts, repeated day in and day out.',
    author: 'Robert Collier',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [editQuote, setEditQuote] = useState('')
  const [editAuthor, setEditAuthor] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const cachedQuote = localStorage.getItem('motivationalQuote')
    if (cachedQuote) {
      setQuote(JSON.parse(cachedQuote))
    } else {
      getNewQuote()
    }
  }, [])

  const getNewQuote = async () => {
    setIsLoading(true)
    try {
      const response = await fetchQuote()
      setQuote(response.data)
      localStorage.setItem('motivationalQuote', JSON.stringify(response.data))
    } catch (error) {
      console.error('Failed to fetch quote', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenEdit = () => {
    setEditQuote(quote.quote)
    setEditAuthor(quote.author)
    onOpen()
  }

  const handleSaveEdit = () => {
    const newQuote = { quote: editQuote, author: editAuthor }
    setQuote(newQuote)
    localStorage.setItem('motivationalQuote', JSON.stringify(newQuote))
    onClose()
  }

  return (
    <HStack spacing={2} align="start">
      <Box position="relative" role="group" flex={1}>
        {isLoading && (
          <Box
            position="absolute"
            inset={0}
            bg="whiteAlpha.700"
            zIndex={10}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="md"
          >
            <Spinner />
          </Box>
        )}
        <Box as="blockquote" borderLeftWidth="4px" borderColor="gray.300" pl={4}>
          <Text fontSize="sm" fontStyle="italic">
            "{quote.quote}"
          </Text>
          <Box
            as="cite"
            display="block"
            textAlign="right"
            color="gray.600"
            fontSize="sm"
          >
            – {quote.author}
          </Box>
        </Box>
      </Box>

      <VStack spacing={1}>
        <IconButton
          icon={<EditIcon />}
          size="xs"
          variant="ghost"
          onClick={handleOpenEdit}
        />
        <IconButton
          icon={<RepeatIcon />}
          size="xs"
          variant="ghost"
          onClick={getNewQuote}
          isDisabled={isLoading}
        />
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add you own Quote!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Quote</FormLabel>
              <Input
                value={editQuote}
                onChange={(e) => setEditQuote(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Author</FormLabel>
              <Input
                value={editAuthor}
                onChange={(e) => setEditAuthor(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="orange" onClick={handleSaveEdit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </HStack>
  )
}

export default QuoteBlock