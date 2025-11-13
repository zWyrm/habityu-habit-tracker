import {
  Flex,
  Heading,
  Spacer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { FaUser } from 'react-icons/fa'
import { exportPdfReport } from '../../api'

const Header = ({ onMobileNavOpen }) => {
  const handleExport = async () => {
    try {
      const response = await exportPdfReport()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const disposition = response.headers['content-disposition']
      const filenameMatch = disposition.match(/filename="?(.+)"?/)
      let filename = filenameMatch[1]

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to export PDF', error)
    }
  }

  return (
    <Flex
      as="header"
      align="center"
      p={4}
      height="64px"
      borderBottom="1px"
      borderColor="gray.200"
    >
      <IconButton
        icon={<HamburgerIcon />}
        display={{ base: 'flex', md: 'none' }}
        onClick={onMobileNavOpen}
        variant="ghost"
        mr={3}
      />
      <Heading size="md">Habityu</Heading>
      <Spacer />
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<Icon as={FaUser} />}
          variant="outline"
          borderRadius="full"
        />
        <MenuList>
          <MenuItem onClick={handleExport}>Export as PDF</MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default Header