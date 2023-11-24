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

import React from 'react'
import InfoIcon from '@mui/icons-material/Info'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import OutlinedInput from '@mui/material/OutlinedInput'
import IconButton from '@mui/material/IconButton'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { alpha, styled } from '@mui/material/styles'
import InputBase from '@mui/material/InputBase'
import SearchIcon from '@mui/icons-material/Search'

interface RunningSessionsSearchBarProps {
  searchFilter: string
  handleSearch: (value: string) => void
  searchBarHelpOpen: boolean
  setSearchBarHelpOpen: (value: boolean) => void
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

function RunningSessionsSearchBar ({
  searchFilter,
  handleSearch,
  searchBarHelpOpen,
  setSearchBarHelpOpen
}: RunningSessionsSearchBarProps): JSX.Element {
  return (
    <Box
      component='span'
      display='flex'
      justifyContent='flex-end'
    >
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          id='search-query-tab-running'
          autoFocus
          value={searchFilter}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search…"
          inputProps={{ 'aria-label': 'search' }}
        />
      </Search>
      <IconButton
        sx={{ padding: '1px' }}
        onClick={() => setSearchBarHelpOpen(true)}
        size='large'
      >
        <InfoIcon />
      </IconButton>
      <SearchBarHelpDialog isDialogOpen={searchBarHelpOpen} onClose={() => setSearchBarHelpOpen(false)} />
    </Box>
  )
}

interface SearchBarHelpDialogProps {
  isDialogOpen: boolean
  onClose: (e) => void
}

function SearchBarHelpDialog ({
  isDialogOpen,
  onClose
}: SearchBarHelpDialogProps): JSX.Element {
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby='search-bar-help-dialog'
      open={isDialogOpen}
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle id='search-bar-help-dialog'>
        <Typography
          gutterBottom component='span'
          sx={{ paddingX: '10px' }}
        >
          <Box
            fontWeight='fontWeightBold'
            mr={1}
            display='inline'
          >
            Search Bar Help Dialog
          </Box>
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ height: '500px' }}
      >
        <p>
          The search field will do a lazy search and look for all the sessions with a matching string
          however if you want to do more complex searches you can use some of the queries below.
        </p>
        <TableContainer>
          <Table sx={{ minWidth: 300 }} aria-label='search bar help table' size='small'>
            <TableHead>
              <TableRow>
                <TableCell><Box fontWeight='bold'>Property to Search</Box></TableCell>
                <TableCell><Box fontWeight='bold'>Sample Query</Box></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Session IDs</TableCell>
                <TableCell><pre>id=aee43d32ks10e85d359029719c20b146</pre></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Browser Name</TableCell>
                <TableCell><pre>browserName=chrome</pre></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Capability</TableCell>
                <TableCell><pre>capabilities,platformName=windows</pre></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <p>The basic syntax for searching is <strong><i>key=value</i></strong> or <strong><i>capabilities,key=value</i></strong>.
          All properties under <strong><i>SessionData</i></strong> are available for search and most capabilities are also searchable
        </p>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color='primary'
          variant='contained'
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RunningSessionsSearchBar
