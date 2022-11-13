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

import androidLogo from '../assets/operating-systems/android.svg'
import macLogo from '../assets/operating-systems/mac.svg'
import windowsLogo from '../assets/operating-systems/windows.svg'
import linuxLogo from '../assets/operating-systems/linux.svg'
import unknownOsLogo from '../assets/operating-systems/unknown.svg'

const osLogo = (os: string): string => {
  if (os.length === 0) {
    return unknownOsLogo
  }

  const osLowerCase: string = os.toLowerCase()
  if (osLowerCase.includes('win')) {
    return windowsLogo
  }
  if (osLowerCase.includes('android')) {
    return androidLogo
  }
  if (osLowerCase.includes('mac') || osLowerCase.includes('ios')) {
    return macLogo
  }
  if (osLowerCase.includes('nix') || osLowerCase.includes('nux') ||
      osLowerCase.includes('aix')) {
    return linuxLogo
  }
  return unknownOsLogo
}

export default osLogo
