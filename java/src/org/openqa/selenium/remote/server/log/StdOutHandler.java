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

package org.openqa.selenium.remote.server.log;

import java.util.logging.LogRecord;
import java.util.logging.StreamHandler;

/**
 * java.util.logging Log RestishHandler logging everything to standard output.
 */
public class StdOutHandler extends StreamHandler {

  /*
   * DGF - would be nice to subclass ConsoleHandler, if it weren't for java bug 4827381
   *
   * http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4827381
   */

  public StdOutHandler() {
    super();
    setOutputStream(System.out);
  }


  @Override
  public synchronized void publish(LogRecord record) {
    super.publish(record);
    flush();
  }

}
