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

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material'
import { ViewColumn as ViewColumnIcon } from '@mui/icons-material'

interface ColumnSelectorProps {
  sessions: any[]
  selectedColumns: string[]
  onColumnSelectionChange: (columns: string[]) => void
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  sessions,
  selectedColumns,
  onColumnSelectionChange
}) => {
  const [open, setOpen] = useState(false)
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [localSelectedColumns, setLocalSelectedColumns] = useState<string[]>(selectedColumns)

  useEffect(() => {
    setLocalSelectedColumns(selectedColumns)
  }, [selectedColumns])

  useEffect(() => {
    let allKeys = new Set<string>()
    try {
      const savedKeys = localStorage.getItem('selenium-grid-all-capability-keys')
      if (savedKeys) {
        const parsedKeys = JSON.parse(savedKeys)
        parsedKeys.forEach((key: string) => allKeys.add(key))
      }
    } catch (e) {
      console.error('Error loading saved capability keys:', e)
    }

    sessions.forEach(session => {
      try {
        const capabilities = JSON.parse(session.capabilities)
        Object.keys(capabilities).forEach(key => {
          if (
            typeof capabilities[key] !== 'object' &&
            !key.startsWith('goog:') &&
            !key.startsWith('moz:') &&
            key !== 'alwaysMatch' &&
            key !== 'firstMatch'
          ) {
            allKeys.add(key)
          }
        })
      } catch (e) {
        console.error('Error parsing capabilities:', e)
      }
    })

    const keysArray = Array.from(allKeys).sort()
    localStorage.setItem('selenium-grid-all-capability-keys', JSON.stringify(keysArray))

    setAvailableColumns(keysArray)
  }, [sessions])

  const handleToggle = (column: string) => {
    setLocalSelectedColumns(prev => {
      if (prev.includes(column)) {
        return prev.filter(col => col !== column)
      } else {
        return [...prev, column]
      }
    })
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleSave = () => {
    onColumnSelectionChange(localSelectedColumns)
    setOpen(false)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setLocalSelectedColumns([...availableColumns])
    } else {
      setLocalSelectedColumns([])
    }
  }

  return (
    <Box>
      <Tooltip title="Select columns to display" arrow placement="top">
        <IconButton
          aria-label="select columns"
          onClick={() => setOpen(true)}
        >
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Select Columns to Display
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" gutterBottom>
            Select capability fields to display as additional columns:
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localSelectedColumns.length === availableColumns.length && availableColumns.length > 0}
                  indeterminate={localSelectedColumns.length > 0 && localSelectedColumns.length < availableColumns.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              }
              label={<Typography fontWeight="bold">Select All / Unselect All</Typography>}
            />
            {availableColumns.map(column => (
              <FormControlLabel
                key={column}
                control={
                  <Checkbox
                    checked={localSelectedColumns.includes(column)}
                    onChange={() => handleToggle(column)}
                  />
                }
                label={column}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ColumnSelector
