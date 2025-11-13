import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import './calendar-styles.css'

const theme = extendTheme({
  fonts: {
    heading: `'Karla', sans-serif`,
    body: `'Karla', sans-serif`,
  },
styles: {
    global: {
        '::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '::-webkit-scrollbar-track': {
            background: 'transparent',
        },

        '::-webkit-scrollbar-thumb': {
            background: 'transparent',
            borderRadius: '10px',
        },
        '::hover ::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.2)',
        },
    },
}
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)