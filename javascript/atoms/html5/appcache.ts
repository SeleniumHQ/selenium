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

/**
 * @fileoverview Atom to access application cache status.
 */

import { getWindow } from '../bot';
import { BotError, ErrorCode } from '../error';
import { API, isSupported } from './html5';

interface WindowWithAppCache extends Window {
  applicationCache?: {
    status: number;
  };
}

/**
 * Returns the current state of the application cache.
 */
export function getStatus(opt_window?: Window): number {
  const win = (opt_window || getWindow()) as WindowWithAppCache;

  if (isSupported(API.APPCACHE, win)) {
    return win.applicationCache!.status;
  } else {
    throw new BotError(ErrorCode.UNKNOWN_ERROR, 'Undefined application cache');
  }
}
