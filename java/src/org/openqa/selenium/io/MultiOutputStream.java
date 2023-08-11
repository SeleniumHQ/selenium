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

package org.openqa.selenium.io;

import java.io.IOException;
import java.io.OutputStream;

/** Output stream demultiplexer */
public class MultiOutputStream extends OutputStream {

  private final OutputStream mandatory;
  private final OutputStream optional;

  public MultiOutputStream(OutputStream mandatory, OutputStream optional) {
    this.mandatory = mandatory;
    this.optional = optional;
  }

  @Override
  public void write(int b) throws IOException {
    mandatory.write(b);
    if (optional != null) {
      optional.write(b);
    }
  }

  @Override
  public void flush() throws IOException {
    mandatory.flush();
    if (optional != null) {
      optional.flush();
    }
  }

  @Override
  public void close() throws IOException {
    mandatory.close();
    if (optional != null) {
      optional.close();
    }
  }
}
