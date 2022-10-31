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

import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Input,
  InputAdornment,
  InputLabel
} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { Visibility, VisibilityOff } from '@mui/icons-material'

interface State {
  amount: string
  password: string
  weight: string
  weightRange: string
  showPassword: boolean
}

const PasswordDialog = (props) => {
  const { title, children, open, openDialog, onConfirm, onCancel } = props
  const [values, setValues] = useState<State>({
    amount: '',
    password: '',
    weight: '',
    weightRange: '',
    showPassword: false
  })

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }
  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onConfirm(values.password)
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => openDialog(false)}
      aria-labelledby='password-dialog'
    >
      <DialogTitle id='password-dialog'>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {children}
        </DialogContentText>
        <FormControl
          sx={{ margin: 1, width: '25ch' }}
          variant='standard'
        >
          <InputLabel
            htmlFor='standard-adornment-password'
          >
            Password
          </InputLabel>
          <Input
            id='standard-adornment-password'
            autoFocus
            margin='dense'
            type={values.showPassword ? 'text' : 'password'}
            value={values.password}
            inputProps={{
              onKeyDown: handleKeyDown
            }}
            fullWidth
            onChange={handleChange('password')}
            endAdornment={
              <InputAdornment position='end'>
                <IconButton
                  aria-label='toggle password visibility'
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  size='large'
                >
                  {values.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          variant='contained'
          onClick={() => {
            openDialog(false)
            onCancel()
          }}
          color='secondary'
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={() => {
            // setOpen(false)
            onConfirm(values.password)
          }}
          color='primary'
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PasswordDialog
