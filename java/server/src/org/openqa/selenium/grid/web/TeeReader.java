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

package org.openqa.selenium.grid.web;

import java.io.IOException;
import java.io.Reader;
import java.io.Writer;

class TeeReader extends Reader {

  private final Reader source;
  private final Writer[] sinks;

  public TeeReader(Reader source, Writer... sinks) {
    this.source = source;
    this.sinks = sinks;
  }

  @Override
  public int read(char[] cbuf, int off, int len) throws IOException {
    int read = source.read(cbuf, off, len);

    if (read != -1) {
      for (Writer sink : sinks) {
        sink.write(cbuf, off, read);
      }
    }
    return read;
  }

  @Override
  public void close() throws IOException {
    source.close();
    for (Writer sink : sinks) {
      sink.close();
    }
  }

  @Override
  public boolean markSupported() {
    return false;
  }
}
