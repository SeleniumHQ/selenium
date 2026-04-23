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

import static java.nio.file.Files.readAttributes;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.attribute.BasicFileAttributes;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;

class FileContentSupplier implements Contents.Supplier {
  private final File file;
  private @Nullable InputStream inputStream;

  FileContentSupplier(File file) {
    this.file = Require.nonNull("File", file);
  }

  @Override
  public synchronized InputStream get() {
    if (inputStream != null) {
      throw new IllegalStateException("File input stream has been opened before");
    }
    try {
      inputStream = Files.newInputStream(file.toPath());
    } catch (IOException e) {
      throw new IllegalStateException("File not readable: " + file.getAbsolutePath(), e);
    }

    return inputStream;
  }

  @Override
  public long length() {
    try {
      BasicFileAttributes attributes = readAttributes(file.toPath(), BasicFileAttributes.class);
      return attributes.size();
    } catch (IOException e) {
      throw new IllegalStateException("File not readable: " + file.getAbsolutePath(), e);
    }
  }

  public void close() {
    if (inputStream != null) {
      try {
        inputStream.close();
      } catch (IOException ignore) {
      }
    }
  }

  @Override
  public String toString() {
    return String.format("Contents.file(%s)", file);
  }

  @Override
  public String contentAsString(Charset charset) {
    throw new UnsupportedOperationException("File content may be too large");
  }
}
