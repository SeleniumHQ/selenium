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
import osLogo from '../../util/os-logo'
import { Box } from '@mui/material'
import { Size } from '../../models/size'

function OsLogo (props): JSX.Element {
  const { osName, size } = props
  const name = osName ?? ''
  const osLogoSize = size ?? Size.S
  return (
    <Box
      component='img'
      marginX={0}
      src={osLogo(name)}
      width={osLogoSize}
      height={osLogoSize}
      alt='OS Logo'
    />
  )
}

export default OsLogo
