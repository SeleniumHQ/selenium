import { createTheme, Theme, adaptV4Theme } from '@mui/material/styles'
import typography from './typography'
import { red } from '@mui/material/colors'

// A custom theme for this app
const theme: Theme = createTheme(adaptV4Theme({
  palette: {
    primary: {
      main: '#615E9B'
    },
    secondary: {
      main: '#F7F8F8'
    },
    error: {
      main: red.A400
    },
    background: {
      default: '#F7F8F8'
    }
  },
  typography
}))

export default theme
