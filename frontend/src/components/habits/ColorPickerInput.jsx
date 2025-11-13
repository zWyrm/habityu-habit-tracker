import { Input, HStack } from '@chakra-ui/react'

const ColorPickerInput = ({ value, onChange, ...props }) => {
  const DEFAULT_COLOR = '#1677FF'

  return (
    <HStack spacing={3} {...props}>
      <Input
        type="text"
        placeholder={DEFAULT_COLOR}
        value={(value || '').toUpperCase()}
        onChange={onChange}
        flex={1}
      />
      <Input
        type="color"
        value={value || DEFAULT_COLOR}
        onChange={onChange}
        height="40px"
        width="40px"
        p="2px"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        cursor="pointer"
      />
    </HStack>
  )
}

export default ColorPickerInput