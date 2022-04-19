import { createTheme, Theme } from '@mui/material/styles'
import typography from './typography'

// A custom theme for this app
const theme: Theme = createTheme({
  palette: {
    primary: {
      main: '#615E9B'
    },
    secondary: {
      main: '#F7F8F8'
    },
    error: {
      main: '#FF1744'
    },
    background: {
      default: '#F7F8F8'
    }
  },
  typography
})

export default theme
