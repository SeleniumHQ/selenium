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

import chromeLogo from '../assets/browsers/chrome.svg'
import edgeLogo from '../assets/browsers/edge.svg'
import operaLogo from '../assets/browsers/opera.svg'
import firefoxLogo from '../assets/browsers/firefox.svg'
import internetExplorerLogo from '../assets/browsers/internet-explorer.png'
import safariLogo from '../assets/browsers/safari.svg'
import safariTechnologyPreviewLogo
  from '../assets/browsers/safari-technology-preview.png'
import unknownBrowserLogo from '../assets/browsers/unknown.svg'

const browserLogo = (browser: string): string => {
  const browserName = browser ?? ''
  if (browserName.length === 0) {
    return unknownBrowserLogo
  }

  switch (browserName.toLowerCase()) {
    case 'chrome':
      return chromeLogo
    case 'microsoftedge':
      return edgeLogo
    case 'msedge':
      return edgeLogo
    case 'opera':
      return operaLogo
    case 'firefox':
      return firefoxLogo
    case 'internet explorer':
      return internetExplorerLogo
    case 'safari':
      return safariLogo
    case 'safari technology preview':
      return safariTechnologyPreviewLogo
    default:
      return unknownBrowserLogo
  }
}

export default browserLogo
