import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import IconButton from '@mui/material/IconButton'
import { Theme } from '@mui/material/styles'
import { StyleRules } from '@mui/styles'
import createStyles from '@mui/styles/createStyles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import MenuIcon from '@mui/icons-material/Menu'
import HelpIcon from '@mui/icons-material/Help'
import clsx from 'clsx'
import React, { ReactNode } from 'react'
import seleniumGridLogo from '../../assets/selenium-grid-logo.svg'
import withStyles from '@mui/styles/withStyles'
import { ApolloClient } from '@apollo/client'

const useStyles = (theme: Theme): StyleRules => createStyles(
  {
    root: {
      display: 'flex'
    },
    toolbar: {
      paddingRight: 24 // keep right padding when drawer closed
    },
    toolbarTitle: {
      display: 'flex',
      width: 'calc(100%)',
      alignItems: 'center',
      justifyContent: 'center'
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    menuButton: {
      marginRight: 36
    },
    menuButtonHidden: {
      display: 'none'
    },
    title: {
      flexGrow: 1,
      color: theme.palette.secondary.main
    },
    gridLogo: {
      width: 52,
      height: 52,
      marginRight: 10
    }
  })

interface TopBarProps {
  subheader: string
  error: boolean
  classes: any
  drawerOpen: boolean
  toggleDrawer: () => void
}

class TopBar extends React.Component<TopBarProps, {}> {
  static defaultProps = {
    error: false,
    drawerOpen: false
  }

  client: ApolloClient<any> | null
  intervalID

  constructor (props) {
    super(props)
    this.client = null
  }

  render (): ReactNode {
    const { subheader, error, classes, drawerOpen, toggleDrawer } = this.props

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position='fixed' className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            {!error && (
              <IconButton
                edge='start'
                color='inherit'
                aria-label={drawerOpen ? 'close drawer' : 'open drawer'}
                onClick={toggleDrawer}
                className={classes.menuButton}
                size='large'
              >
                {drawerOpen ? (<ChevronLeftIcon />) : (<MenuIcon />)}
              </IconButton>
            )}
            <IconButton
              edge='start'
              color='inherit'
              aria-label='help'
              href='#help'
              className={clsx(classes.menuButton,
                !error && classes.menuButtonHidden)}
              size='large'
            >
              <HelpIcon />
            </IconButton>
            <Box className={classes.toolbarTitle}>
              <img
                src={seleniumGridLogo}
                className={classes.gridLogo}
                alt='Selenium Grid Logo'
              />
              <Box
                alignItems='center'
                display='flex'
                flexDirection='column'
              >
                <Typography
                  className={classes.title}
                  component='h1'
                  variant='h4'
                  noWrap
                >
                  Selenium Grid
                </Typography>
                <Typography variant='body2'>
                  {subheader}
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

export default withStyles(useStyles)(TopBar)
