import { CssBaseline } from '@mui/material'
import {
  StyledEngineProvider,
  Theme,
  ThemeProvider
} from '@mui/material/styles'
import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'
import App from './App'
import * as serviceWorker from './serviceWorker'
import theme from './theme/theme'
import './index.css'

declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
}

ReactDOM.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kick-start an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline/>
        <Router>
          <App/>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
