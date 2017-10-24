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

package org.openqa.selenium.os;

import com.sun.jna.Native;
import com.sun.jna.win32.W32APIOptions;

public interface Kernel32 extends com.sun.jna.platform.win32.Kernel32 {
  Kernel32 INSTANCE = (Kernel32) Native.loadLibrary(
      "kernel32", Kernel32.class, W32APIOptions.UNICODE_OPTIONS);

  int GetProcessId(HANDLE Process);

}
