// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import React, { ReactNode } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Theme,
  withStyles
} from '@material-ui/core'
import InfoIcon from '@material-ui/icons/Info'
import VideocamIcon from '@material-ui/icons/Videocam'
import Slide from '@material-ui/core/Slide'
import { StyleRules } from '@material-ui/core/styles'
import { TransitionProps } from '@material-ui/core/transitions'
import browserVersion from '../../util/browser-version'
import EnhancedTableToolbar from '../EnhancedTableToolbar'
import prettyMilliseconds from 'pretty-ms'
import BrowserLogo from '../common/BrowserLogo'
import OsLogo from '../common/OsLogo'
import { Size } from '../../models/size'
import Capabilities from '../../models/capabilities'
import LiveView from '../LiveView/LiveView'

interface SessionData {
  id: string
  capabilities: string
  browserName: string
  browserVersion: string
  platformName: string
  startTime: string
  uri: string
  nodeId: string
  nodeUri: string
  sessionDurationMillis: number
  slot: any,
  vnc: string,
  name: string,
}

function createSessionData (
  id: string,
  capabilities: string,
  startTime: string,
  uri: string,
  nodeId: string,
  nodeUri: string,
  sessionDurationMillis: number,
  slot: any
): SessionData {
  const parsed = JSON.parse(capabilities) as Capabilities
  const browserName = parsed.browserName
  const browserVersion = parsed.browserVersion ?? parsed.version
  const platformName = parsed.platformName ?? parsed.platform
  const vnc: string = parsed['se:vnc'] ?? ''
  const name: string = parsed['se:name'] ?? id
  return {
    id,
    capabilities,
    browserName,
    browserVersion,
    platformName,
    startTime,
    uri,
    nodeId,
    nodeUri,
    sessionDurationMillis,
    slot,
    vnc,
    name
  }
}

function descendingComparator<T> (a: T, b: T, orderBy: keyof T): number {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

type Order = 'asc' | 'desc'

function getComparator<Key extends keyof any> (
  order: Order,
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort<T> (array: T[], comparator: (a: T, b: T) => number): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

interface HeadCell {
  id: keyof SessionData
  label: string
  numeric: boolean
}

const headCells: HeadCell[] = [
  { id: 'id', numeric: false, label: 'Session' },
  { id: 'capabilities', numeric: false, label: 'Capabilities' },
  { id: 'startTime', numeric: false, label: 'Start time' },
  { id: 'sessionDurationMillis', numeric: false, label: 'Duration' },
  { id: 'nodeUri', numeric: false, label: 'Node URI' }
]

interface EnhancedTableProps {
  classes: any
  onRequestSort: (event: React.MouseEvent<unknown>,
    property: keyof SessionData) => void
  order: Order
  orderBy: string
}

function EnhancedTableHead (props: EnhancedTableProps): JSX.Element {
  const { classes, order, orderBy, onRequestSort } = props
  const createSortHandler = (property: keyof SessionData) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align='left'
            padding='default'
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              <Box fontWeight='fontWeightBold' mr={1} display='inline'>
                {headCell.label}
              </Box>
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const useStyles = (theme: Theme): StyleRules => createStyles(
  {
    root: {
      width: '100%'
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2)
    },
    table: {
      minWidth: 750
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1
    },
    buttonMargin: {
      padding: 1
    },
    textPadding: {
      paddingLeft: 10,
      paddingRight: 10
    },
    dialogContent: {
      height: 600
    },
    queueList: {
      minWidth: 750,
      backgroundColor: theme.palette.background.paper,
      marginBottom: 20
    },
    queueListItem: {
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: '#e0e0e0'
    }
  })

interface RunningSessionsProps {
  sessions: SessionData[]
  classes: any
}

interface RunningSessionsState {
  order: Order
  orderBy: keyof SessionData
  selected: string[]
  page: number
  dense: boolean
  rowsPerPage: number
  rowOpen: string
  rowLiveViewOpen: string
}

const Transition = React.forwardRef(function Transition (
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

class RunningSessions extends React.Component<RunningSessionsProps, RunningSessionsState> {
  constructor (props) {
    super(props)
    this.state = {
      order: 'asc',
      orderBy: 'startTime',
      selected: [],
      page: 0,
      dense: false,
      rowsPerPage: 5,
      rowOpen: '',
      rowLiveViewOpen: ''
    }
  }

  handleDialogOpen = (rowId: string): void => {
    this.setState({ rowOpen: rowId })
  }

  handleDialogClose = (): void => {
    this.setState({ rowOpen: '' })
  }

  handleLiveViewOpen = (rowId: string): void => {
    this.setState({ rowLiveViewOpen: rowId })
  }

  handleLiveViewClose = (): void => {
    this.setState({ rowLiveViewOpen: '' })
  }

  handleRequestSort = (event: React.MouseEvent<unknown>,
    property: keyof SessionData): void => {
    const { orderBy, order } = this.state
    const isAsc = orderBy === property && order === 'asc'
    this.setState({ order: (isAsc ? 'desc' : 'asc'), orderBy: property })
  }

  handleClick = (event: React.MouseEvent<unknown>, name: string): void => {
    const { selected } = this.state
    const selectedIndex = selected.indexOf(name)
    let newSelected: string[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }
    this.setState({ selected: newSelected })
  }

  handleChangePage = (event: unknown, newPage: number): void => {
    this.setState({ page: newPage })
  }

  handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0 })
  }

  handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ dense: event.target.checked })
  }

  isSelected = (name: string): boolean => this.state.selected.includes(name)

  displaySessionInfo = (id: string): JSX.Element => {
    const handleInfoIconClick = (): void => {
      this.handleDialogOpen(id)
    }
    const { classes } = this.props
    return (
      <IconButton className={classes.buttonMargin}
                  onClick={handleInfoIconClick}>
        <InfoIcon/>
      </IconButton>
    )
  }

  displayLiveView = (id: string): JSX.Element => {
    const handleLiveViewIconClick = (): void => {
      this.handleLiveViewOpen(id)
    }
    const { classes } = this.props
    return (
      <IconButton className={classes.buttonMargin}
                  onClick={handleLiveViewIconClick}>
        <VideocamIcon/>
      </IconButton>
    )
  }

  render (): ReactNode {
    const { sessions, classes } = this.props
    const { dense, order, orderBy, page, rowOpen, rowLiveViewOpen, rowsPerPage } = this.state

    const rows = sessions.map((session) => {
      return createSessionData(
        session.id,
        session.capabilities,
        session.startTime,
        session.uri,
        session.nodeId,
        session.nodeUri,
        session.sessionDurationMillis,
        session.slot
      )
    })
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage)

    return (
      <div className={classes.root}>
        {rows.length > 0 && (
          <div>
            <Paper className={classes.paper}>
              <EnhancedTableToolbar title='Running' />
              <TableContainer>
                <Table
                  className={classes.table}
                  aria-labelledby='tableTitle'
                  size={dense ? 'small' : 'medium'}
                  aria-label='enhanced table'
                >
                  <EnhancedTableHead
                    classes={classes}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={this.handleRequestSort}
                  />
                  <TableBody>
                    {stableSort(rows, getComparator(order, orderBy))
                      .slice(page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage)
                      .map((row, index) => {
                        const isItemSelected = this.isSelected(
                          row.id as string)
                        const labelId = `enhanced-table-checkbox-${index}`
                        return (
                          <TableRow
                            hover
                            onClick={(event) =>
                              this.handleClick(event, row.id as string)}
                            role='checkbox'
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.id}
                            selected={isItemSelected}
                          >
                            <TableCell
                              component='th'
                              id={labelId}
                              scope='row'
                              align='left'
                            >
                              {
                                (row.vnc as string).length > 0 &&
                                this.displayLiveView(row.id as string)
                              }
                              {row.id}
                              {
                                (row.vnc as string).length > 0 &&
                                <Dialog
                                  onClose={this.handleLiveViewClose}
                                  aria-labelledby='live-view-dialog'
                                  open={rowLiveViewOpen === row.id}
                                  fullWidth={true}
                                  maxWidth={'xl'}
                                  fullScreen
                                  TransitionComponent={Transition}
                                >
                                  <DialogTitle id='live-view-dialog'>
                                    <Typography gutterBottom component='span'
                                                className={classes.textPadding}
                                    >
                                      <Box fontWeight='fontWeightBold'
                                           mr={1}
                                           display='inline'>
                                        Session
                                      </Box>
                                      {row.name}
                                    </Typography>
                                    <OsLogo
                                      osName={row.platformName as string}/>
                                    <BrowserLogo
                                      browserName={row.browserName as string}/>
                                    {browserVersion(
                                      row.browserVersion as string)}
                                  </DialogTitle>
                                  <DialogContent
                                    dividers
                                    className={classes.dialogContent}
                                  >
                                    <LiveView
                                      url={row.vnc as string}
                                      scaleViewport={true}
                                    />
                                  </DialogContent>
                                  <DialogActions>
                                    <Button
                                      onClick={this.handleLiveViewClose}
                                      color='primary'
                                      variant='contained'>
                                      Close
                                    </Button>
                                  </DialogActions>
                                </Dialog>
                              }
                            </TableCell>
                            <TableCell align='left'>
                              {this.displaySessionInfo(row.id as string)}
                              <OsLogo osName={row.platformName as string}
                                      size={Size.S}/>
                              <BrowserLogo
                                browserName={row.browserName as string}/>
                              {browserVersion(row.browserVersion as string)}
                              <Dialog
                                onClose={this.handleDialogClose}
                                aria-labelledby='session-info-dialog'
                                open={rowOpen === row.id}
                                fullWidth={true}
                                maxWidth={'md'}
                              >
                                <DialogTitle id='session-info-dialog'>
                                  <Typography gutterBottom component='span'
                                              className={classes.textPadding}
                                  >
                                    <Box fontWeight='fontWeightBold'
                                         mr={1}
                                         display='inline'>
                                      Session
                                    </Box>
                                    {row.name}
                                  </Typography>
                                  <OsLogo osName={row.platformName as string}/>
                                  <BrowserLogo
                                    browserName={row.browserName as string}/>
                                  {browserVersion(row.browserVersion as string)}
                                </DialogTitle>
                                <DialogContent dividers>
                                  <Typography gutterBottom>
                                    Capabilities:
                                  </Typography>
                                  <Typography gutterBottom component='span'>
                                    <pre>
                                      {JSON.stringify(
                                        JSON.parse(
                                          row.capabilities as string) as object,
                                        null, 2)}
                                    </pre>
                                  </Typography>
                                </DialogContent>
                                <DialogActions>
                                  <Button
                                    onClick={this.handleDialogClose}
                                    color='primary'
                                    variant='contained'>
                                    Close
                                  </Button>
                                </DialogActions>
                              </Dialog>
                            </TableCell>
                            <TableCell align='left'>
                              {row.startTime}
                            </TableCell>
                            <TableCell align='left'>
                              {prettyMilliseconds(
                                Number(row.sessionDurationMillis))}
                            </TableCell>
                            <TableCell align='left'>
                              {row.nodeUri}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 15]}
                component='div'
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            </Paper>
            <FormControlLabel
              control={<Switch checked={dense} onChange={this.handleChangeDense} />}
              label='Dense padding'
            />
          </div>
        )}
      </div>
    )
  }
}

export default withStyles(useStyles)(RunningSessions)
