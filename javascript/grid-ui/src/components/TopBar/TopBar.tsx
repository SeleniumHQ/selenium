import MuiAppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import MenuIcon from '@mui/icons-material/Menu'
import HelpIcon from '@mui/icons-material/Help'
import React from 'react'
import seleniumGridLogo from '../../assets/selenium-grid-logo.svg'

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  })
}))

function TopBar (props): JSX.Element {
  const { subheader, error, drawerOpen, toggleDrawer } = props

  return (
    <Box display="flex">
      <CssBaseline/>
      <AppBar position="fixed">
        <Toolbar sx={{ paddingRight: '24px' }}>
          {!error && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label={drawerOpen ? 'close drawer' : 'open drawer'}
              onClick={toggleDrawer}
              size="large"
              sx={{ marginRight: '36px' }}
            >
              {drawerOpen ? (<ChevronLeftIcon/>) : (<MenuIcon/>)}
            </IconButton>
          )}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="help"
            href="#help"
            sx={{ marginRight: '36px', display: !error ? 'none' : '' }}
            size="large"
          >
            <HelpIcon/>
          </IconButton>
          <Box
            sx={{
              display: 'flex',
              width: 'calc(100%)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              component="img"
              src={seleniumGridLogo}
              alt="Selenium Grid Logo"
              sx={{
                width: 52,
                height: 52,
                marginRight: '10px'
              }}
            />
            <Box
              alignItems="center"
              display="flex"
              flexDirection="column"
            >
              <Typography
                component="h1"
                variant="h4"
                noWrap
              >
                Selenium Grid
              </Typography>
              <Typography variant="body2">
                {subheader}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default TopBar
