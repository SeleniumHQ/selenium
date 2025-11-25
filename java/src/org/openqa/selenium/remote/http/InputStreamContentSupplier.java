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

package org.openqa.selenium.remote.http;

import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.nio.charset.Charset;
import org.openqa.selenium.internal.Require;

class InputStreamContentSupplier implements Contents.Supplier {

  private final InputStream stream;
  private final long length;

  InputStreamContentSupplier(InputStream stream, long length) {
    this.stream = Require.nonNull("InputStream", stream);
    this.length = length;
  }

  @Override
  public InputStream get() {
    return stream;
  }

  @Override
  public long length() {
    return length;
  }

  public void close() {
    try {
      stream.close();
    } catch (IOException ignore) {
    }
  }

  @Override
  public String toString() {
    return String.format("Contents.fromStream(%s bytes)", length);
  }

  @Override
  public String contentAsString(Charset charset) {
    throw new UnsupportedOperationException("Don't serialize binary stream - it might be large");
  }

  @Override
  public Reader reader(Charset charset) {
    throw new UnsupportedOperationException("Don't read binary stream  - it might be large");
  }
}
