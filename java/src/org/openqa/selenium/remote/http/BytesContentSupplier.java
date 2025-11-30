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

import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.Charset;
import org.openqa.selenium.internal.Require;

public class BytesContentSupplier implements Contents.Supplier {
  private final byte[] bytes;

  public BytesContentSupplier(byte[] bytes) {
    this.bytes = Require.nonNull("Bytes to return", bytes, "may be empty");
  }

  private boolean closed;

  @Override
  public InputStream get() {
    if (closed) throw new IllegalStateException("Contents.Supplier has been closed before");

    return new ByteArrayInputStream(bytes);
  }

  @Override
  public long length() {
    if (closed) throw new IllegalStateException("Contents.Supplier has been closed before");

    return bytes.length;
  }

  public void close() {
    closed = true;
  }

  @Override
  public String toString() {
    return bytes.length < 256
        ? new String(bytes, UTF_8)
        : String.format("%s bytes: \"%s\"...", bytes.length, new String(bytes, 0, 256, UTF_8));
  }

  @Override
  public String contentAsString(Charset charset) {
    return new String(bytes, charset);
  }
}
