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

import React, { useState, useRef, useEffect } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import {Videocam as VideocamIcon } from '@mui/icons-material'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import browserVersion from '../../util/browser-version'
import EnhancedTableToolbar from '../EnhancedTableToolbar'
import prettyMilliseconds from 'pretty-ms'
import BrowserLogo from '../common/BrowserLogo'
import OsLogo from '../common/OsLogo'
import RunningSessionsSearchBar from './RunningSessionsSearchBar'
import { Size } from '../../models/size'
import LiveView from '../LiveView/LiveView'
import SessionData, { createSessionData } from '../../models/session-data'
import { useNavigate } from 'react-router-dom'
import ColumnSelector from './ColumnSelector'

function descendingComparator<T> (a: T, b: T, orderBy: keyof T): number {
  if (orderBy === 'sessionDurationMillis') {
    return Number(b[orderBy]) - Number(a[orderBy])
  }
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

const fixedHeadCells: HeadCell[] = [
  { id: 'id', numeric: false, label: 'Session' },
  { id: 'capabilities', numeric: false, label: 'Capabilities' },
  { id: 'startTime', numeric: false, label: 'Start time' },
  { id: 'sessionDurationMillis', numeric: true, label: 'Duration' },
  { id: 'nodeUri', numeric: false, label: 'Node URI' }
]

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>,
    property: keyof SessionData) => void
  order: Order
  orderBy: string
  headCells: HeadCell[]
}

function EnhancedTableHead (props: EnhancedTableProps): JSX.Element {
  const { order, orderBy, onRequestSort, headCells } = props
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
            padding='normal'
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
              {orderBy === headCell.id
                ? (
                  <Box
                    component='span'
                    sx={{
                      border: 0,
                      clip: 'rect(0 0 0 0)',
                      height: 1,
                      margin: -1,
                      overflow: 'hidden',
                      padding: 0,
                      position: 'absolute',
                      top: 20,
                      width: 1
                    }}
                  >
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                  )
                : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const Transition = React.forwardRef(function Transition (
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

function RunningSessions (props) {
  const [rowOpen, setRowOpen] = useState('')
  const [rowLiveViewOpen, setRowLiveViewOpen] = useState('')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState('')
  const [deleteLocation, setDeleteLocation] = useState('') // 'info' or 'liveview'
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackSeverity, setFeedbackSeverity] = useState('success')
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<keyof SessionData>('sessionDurationMillis')
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [dense, setDense] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchFilter, setSearchFilter] = useState('')
  const [searchBarHelpOpen, setSearchBarHelpOpen] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    try {
      const savedColumns = localStorage.getItem('selenium-grid-selected-columns')
      return savedColumns ? JSON.parse(savedColumns) : []
    } catch (e) {
      console.error('Error loading saved columns:', e)
      return []
    }
  })
  const [headCells, setHeadCells] = useState<HeadCell[]>(fixedHeadCells)
  const liveViewRef = useRef(null)
  const navigate = useNavigate()

  const handleDialogClose = () => {
    if (liveViewRef.current) {
      liveViewRef.current.disconnect()
    }
    navigate('/sessions')
  }

  const handleRequestSort = (event: React.MouseEvent<unknown>,
    property: keyof SessionData) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
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
    setSelected(newSelected)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked)
  }

  const isSelected = (name: string): boolean => selected.includes(name)

  const handleDeleteConfirmation = (sessionId: string, location: string) => {
    setSessionToDelete(sessionId)
    setDeleteLocation(location)
    setConfirmDeleteOpen(true)
  }

  const handleDeleteSession = async () => {
    try {
      const session = sessions.find(s => s.id === sessionToDelete)
      if (!session) {
        setFeedbackMessage('Session not found')
        setFeedbackSeverity('error')
        setConfirmDeleteOpen(false)
        setFeedbackOpen(true)
        return
      }

      let deleteUrl = ''

      const parsed = JSON.parse(session.capabilities)
      let wsUrl = parsed['webSocketUrl'] ?? ''
      if (wsUrl.length > 0) {
        try {
          const url = new URL(origin)
          const sessionUrl = new URL(wsUrl)
          url.pathname = sessionUrl.pathname.split('/se/')[0] // Remove /se/ and everything after
          url.protocol = sessionUrl.protocol === 'wss:' ? 'https:' : 'http:'
          deleteUrl = url.href
        } catch (error) {
          deleteUrl = ''
        }
      }

      if (!deleteUrl) {
        const currentUrl = window.location.href
        const baseUrl = currentUrl.split('/ui/')[0] // Remove /ui/ and everything after
        deleteUrl = `${baseUrl}/session/${sessionToDelete}`
      }

      const response = await fetch(deleteUrl, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFeedbackMessage('Session deleted successfully')
        setFeedbackSeverity('success')
        if (deleteLocation === 'liveview') {
          handleDialogClose()
        } else {
          setRowOpen('')
        }
      } else {
        setFeedbackMessage('Failed to delete session')
        setFeedbackSeverity('error')
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      setFeedbackMessage('Error deleting session')
      setFeedbackSeverity('error')
    }

    setConfirmDeleteOpen(false)
    setFeedbackOpen(true)
    setSessionToDelete('')
    setDeleteLocation('')
  }

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false)
    setSessionToDelete('')
    setDeleteLocation('')
  }

  const displaySessionInfo = (id: string): JSX.Element => {
    const handleInfoIconClick = (): void => {
      setRowOpen(id)
    }
    return (
      <IconButton
        sx={{ padding: '1px' }}
        onClick={handleInfoIconClick}
        size='large'
      >
        <InfoIcon />
      </IconButton>
    )
  }

  const displayLiveView = (id: string): JSX.Element => {
    const handleLiveViewIconClick = (): void => {
      navigate(`/session/${id}`)
    }
    return (
      <IconButton
        sx={{ padding: '1px' }}
        onClick={handleLiveViewIconClick}
        size='large'
      >
        <VideocamIcon />
      </IconButton>
    )
  }

  const { sessions, origin, sessionId } = props

  const getCapabilityValue = (capabilitiesStr: string, key: string): string => {
    try {
      const capabilities = JSON.parse(capabilitiesStr as string)
      const value = capabilities[key]

      if (value === undefined || value === null) {
        return ''
      }

      if (typeof value === 'object') {
        return JSON.stringify(value)
      }

      return String(value)
    } catch (e) {
      return ''
    }
  }

  const hasDeleteSessionCapability = (capabilitiesStr: string): boolean => {
    try {
      const capabilities = JSON.parse(capabilitiesStr as string)
      return capabilities['se:deleteSessionOnUi'] === true
    } catch (e) {
      return false
    }
  }

  const rows = sessions.map((session) => {
    const sessionData = createSessionData(
      session.id,
      session.capabilities,
      session.startTime,
      session.uri,
      session.nodeId,
      session.nodeUri,
      session.sessionDurationMillis,
      session.slot,
      origin
    )

    selectedColumns.forEach(column => {
      sessionData[column] = getCapabilityValue(session.capabilities, column)
    })

    return sessionData
  })
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage)

  useEffect(() => {
    let s = sessionId || ''

    let session_ids = sessions.map((session) => session.id)

    if (!session_ids.includes(s)) {
      setRowLiveViewOpen('')
      navigate('/sessions')
    } else {
      setRowLiveViewOpen(s)
    }
  }, [sessionId, sessions])

  useEffect(() => {
    const dynamicHeadCells = selectedColumns.map(column => ({
      id: column,
      numeric: false,
      label: column
    }))

    setHeadCells([...fixedHeadCells, ...dynamicHeadCells])
  }, [selectedColumns])

  return (
    <Box width='100%'>
      {rows.length > 0 && (
        <div>
          <Paper sx={{ width: '100%', marginBottom: 2 }}>
            <EnhancedTableToolbar title='Running'>
              <Box display="flex" alignItems="center">
                <ColumnSelector
                  sessions={sessions}
                  selectedColumns={selectedColumns}
                  onColumnSelectionChange={(columns) => {
                    setSelectedColumns(columns)
                    localStorage.setItem('selenium-grid-selected-columns', JSON.stringify(columns))
                  }}
                />
                <RunningSessionsSearchBar
                  searchFilter={searchFilter}
                  handleSearch={setSearchFilter}
                  searchBarHelpOpen={searchBarHelpOpen}
                  setSearchBarHelpOpen={setSearchBarHelpOpen}
                />
              </Box>
            </EnhancedTableToolbar>
            <TableContainer>
              <Table
                sx={{ minWidth: '750px' }}
                aria-labelledby='tableTitle'
                size={dense ? 'small' : 'medium'}
                aria-label='enhanced table'
              >
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  headCells={headCells}
                />
                <TableBody>
                  {stableSort(rows, getComparator(order, orderBy))
                    .filter((session) => {
                      if (searchFilter === '') {
                        // don't filter anything on empty search field
                        return true
                      }

                      if (!searchFilter.includes('=')) {
                        // filter on the entire session if users don't use `=` symbol
                        return JSON.stringify(session)
                          .toLowerCase()
                          .includes(searchFilter.toLowerCase())
                      }

                      const [filterField, filterItem] = searchFilter.split('=')
                      if (filterField.startsWith('capabilities,')) {
                        const capabilityID = filterField.split(',')[1]
                        return (JSON.parse(session.capabilities as string) as object)[capabilityID] === filterItem
                      }
                      return session[filterField] === filterItem
                    })
                    .slice(page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const isItemSelected = isSelected(row.id as string)
                      const labelId = `enhanced-table-checkbox-${index}`
                      return (
                        <TableRow
                          hover
                          onClick={(event) =>
                            handleClick(event, row.id as string)}
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
                                displayLiveView(row.id as string)
                              }
                            {row.name}
                            {
                                (row.vnc as string).length > 0 &&
                                  <Dialog
                                    onClose={() => navigate("/sessions")}
                                    aria-labelledby='live-view-dialog'
                                    open={rowLiveViewOpen === row.id}
                                    fullWidth
                                    maxWidth='xl'
                                    fullScreen
                                    TransitionComponent={Transition}
                                  >
                                    <DialogTitle id='live-view-dialog'>
                                      <Typography
                                        gutterBottom component='span'
                                        sx={{ paddingX: '10px' }}
                                      >
                                        <Box
                                          fontWeight='fontWeightBold'
                                          mr={1}
                                          display='inline'
                                        >
                                          Session
                                        </Box>
                                        {row.name}
                                      </Typography>
                                      <OsLogo
                                        osName={row.platformName as string}
                                      />
                                      <BrowserLogo
                                        browserName={row.browserName as string}
                                      />
                                      {browserVersion(
                                        row.browserVersion as string)}
                                    </DialogTitle>
                                    <DialogContent
                                      dividers
                                      sx={{ height: '600px' }}
                                    >
                                      <LiveView
                                        ref={liveViewRef}
                                        url={row.vnc as string}
                                        scaleViewport
                                        onClose={() => navigate("/sessions")}
                                      />
                                    </DialogContent>
                                    <DialogActions>
                                      <Button
                                        onClick={handleDialogClose}
                                        color='primary'
                                        variant='contained'
                                      >
                                        Close
                                      </Button>
                                    </DialogActions>
                                  </Dialog>
                              }
                          </TableCell>
                          <TableCell align='left'>
                            {displaySessionInfo(row.id as string)}
                            <OsLogo
                              osName={row.platformName as string}
                              size={Size.S}
                            />
                            <BrowserLogo
                              browserName={row.browserName as string}
                            />
                            {browserVersion(row.browserVersion as string)}
                            <Dialog
                              onClose={() => setRowOpen('')}
                              aria-labelledby='session-info-dialog'
                              open={rowOpen === row.id}
                              fullWidth
                              maxWidth='md'
                            >
                              <DialogTitle id='session-info-dialog'>
                                <Typography
                                  gutterBottom component='span'
                                  sx={{ paddingX: '10px' }}
                                >
                                  <Box
                                    fontWeight='fontWeightBold'
                                    mr={1}
                                    display='inline'
                                  >
                                    Session
                                  </Box>
                                  {row.name}
                                </Typography>
                                <OsLogo osName={row.platformName as string} />
                                <BrowserLogo
                                  browserName={row.browserName as string}
                                />
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
                                {hasDeleteSessionCapability(row.capabilities as string) && (
                                  <Button
                                    onClick={() => handleDeleteConfirmation(row.id as string, 'info')}
                                    color='error'
                                    variant='contained'
                                    sx={{ marginRight: 1 }}
                                  >
                                    Delete
                                  </Button>
                                )}
                                <Button
                                  onClick={() => setRowOpen('')}
                                  color='primary'
                                  variant='contained'
                                >
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
                          {/* Add dynamic columns */}
                          {selectedColumns.map(column => (
                            <TableCell key={column} align='left'>{row[column]}</TableCell>
                          ))}
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
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
          <FormControlLabel
            control={<Switch
              checked={dense}
              onChange={handleChangeDense}
                     />}
            label='Dense padding'
          />
        </div>
      )}
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={handleCancelDelete}
        aria-labelledby='delete-confirmation-dialog'
      >
        <DialogTitle id='delete-confirmation-dialog'>
          Confirm Session Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this session? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            color='primary'
            variant='outlined'
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSession}
            color='error'
            variant='contained'
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        aria-labelledby='feedback-dialog'
      >
        <DialogTitle id='feedback-dialog'>
          {feedbackSeverity === 'success' ? 'Success' : 'Error'}
        </DialogTitle>
        <DialogContent>
          <Typography color={feedbackSeverity === 'success' ? 'success.main' : 'error.main'}>
            {feedbackMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setFeedbackOpen(false)}
            color='primary'
            variant='contained'
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RunningSessions
