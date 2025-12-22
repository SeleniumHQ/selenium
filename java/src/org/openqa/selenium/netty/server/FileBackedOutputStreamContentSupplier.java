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

package org.openqa.selenium.netty.server;

import com.google.common.io.FileBackedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import org.openqa.selenium.remote.http.Contents;

class FileBackedOutputStreamContentSupplier implements Contents.Supplier {
  private final String description;
  private final FileBackedOutputStream buffer;
  private final long length;

  FileBackedOutputStreamContentSupplier(
      String description, FileBackedOutputStream buffer, long length) {
    this.description = description;
    this.buffer = buffer;
    this.length = length;
  }

  @Override
  public InputStream get() {
    try {
      return buffer.asByteSource().openBufferedStream();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Override
  public long length() {
    return length;
  }

  @Override
  public void close() throws IOException {
    buffer.reset();
  }

  @Override
  public String toString() {
    return String.format("Content for %s (%s bytes)", description, length);
  }

  @Override
  public String contentAsString(Charset charset) {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    try {
      buffer.asByteSource().copyTo(out);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    return out.toString(charset);
  }
}
