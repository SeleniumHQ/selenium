import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import CssBaseline from '@material-ui/core/CssBaseline'
import IconButton from '@material-ui/core/IconButton'
import { createStyles, StyleRules, Theme } from '@material-ui/core/styles'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import MenuIcon from '@material-ui/icons/Menu'
import HelpIcon from '@material-ui/icons/Help'
import clsx from 'clsx'
import React, { ReactNode } from 'react'
import seleniumGridLogo from '../../assets/selenium-grid-logo.svg'
import { withStyles } from '@material-ui/core'
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
