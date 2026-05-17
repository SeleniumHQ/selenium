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

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.Objects.requireNonNull;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;

/** Helper methods to read input stream and return the result in different formats. */
public class Read {

  private Read() {}

  /**
   * Equivalent to Java's built-in method {@link InputStream#readAllBytes()}. But the latter has <a
   * href="https://bugs.openjdk.org/browse/JDK-8228970">a bug</a> in Java 11 (fixed only in Java
   * 14+).
   *
   * <p>This method can be removed when we upgrade to Java 17+.
   */
  public static byte[] toByteArray(InputStream in) throws IOException {
    int estimatedSize = Math.max(in.available(), 1024);
    try (ByteArrayOutputStream out = new ByteArrayOutputStream(estimatedSize)) {
      byte[] buffer = new byte[Math.min(estimatedSize, 4096)];

      int readCount;
      while ((readCount = in.read(buffer)) != -1) {
        out.write(buffer, 0, readCount);
      }
      return out.toByteArray();
    }
  }

  public static String toString(InputStream in) throws IOException {
    return new String(toByteArray(in), UTF_8);
  }

  /**
   * This method might not work in OSGI environment.
   *
   * @deprecated Use {@link #resourceAsString(Class, String)} instead
   */
  @Deprecated
  public static String resourceAsString(String resource) {
    return resourceAsString(Read.class, resource);
  }

  public static String resourceAsString(Class<?> resourceOwner, String resource) {
    Class<?> clazz = requireNonNull(resourceOwner, "Class owning the resource");
    try (InputStream stream = clazz.getResourceAsStream(resource)) {
      if (stream == null) {
        throw new IllegalArgumentException("Resource not found: " + resource);
      }
      return toString(stream);
    } catch (IOException e) {
      throw new UncheckedIOException("Failed to read resource " + resource, e);
    }
  }
}
