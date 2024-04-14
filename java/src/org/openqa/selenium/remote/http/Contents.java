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
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.util.Base64;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.JsonOutput;

public class Contents {

  private static final Json JSON = new Json();

  /**
   * A supplier that can be called multiple times, each invocation must return a new InputStream
   * ready to read. The number of bytes that can be read from the InputStream must be identical to
   * the number returned by the length method.
   */
  public interface Supplier extends java.util.function.Supplier<InputStream>, AutoCloseable {

    /**
     * @return the number of bytes that can be read from the InputStream returned by calling the get
     *     method.
     */
    int length();

    /**
     * Release the related resources, if any.
     *
     * @throws IOException on I/O failure
     */
    @Override
    void close() throws IOException;
  }

  private Contents() {
    // Utility class
  }

  public static Supplier empty() {
    return bytes(new byte[0]);
  }

  public static Supplier utf8String(CharSequence value) {
    Require.nonNull("Value to return", value);

    return string(value, UTF_8);
  }

  public static Supplier string(CharSequence value, Charset charset) {
    Require.nonNull("Value to return", value);
    Require.nonNull("Character set", charset);

    return bytes(value.toString().getBytes(charset));
  }

  public static Supplier bytes(byte[] bytes) {
    Require.nonNull("Bytes to return", bytes, "may be empty");

    return new Supplier() {
      private boolean closed;

      @Override
      public InputStream get() {
        if (closed) throw new IllegalStateException("Contents.Supplier has been closed before");

        return new ByteArrayInputStream(bytes);
      }

      @Override
      public int length() {
        if (closed) throw new IllegalStateException("Contents.Supplier has been closed before");

        return bytes.length;
      }

      public void close() {
        closed = true;
      }
    };
  }

  public static byte[] bytes(Supplier supplier) {
    Require.nonNull("Supplier of input", supplier);

    try (InputStream is = supplier.get();
        ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
      is.transferTo(bos);
      return bos.toByteArray();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static String utf8String(Supplier supplier) {
    return string(supplier, UTF_8);
  }

  public static String string(Supplier supplier, Charset charset) {
    Require.nonNull("Supplier of input", supplier);
    Require.nonNull("Character set", charset);

    return new String(bytes(supplier), charset);
  }

  public static String string(HttpMessage<?> message) {
    return string(message.getContent(), message.getContentEncoding());
  }

  public static Reader utf8Reader(Supplier supplier) {
    Require.nonNull("Supplier", supplier);

    return reader(supplier, UTF_8);
  }

  public static Reader reader(Supplier supplier, Charset charset) {
    Require.nonNull("Supplier of input", supplier);
    Require.nonNull("Character set", charset);

    return new InputStreamReader(supplier.get(), charset);
  }

  public static Reader reader(HttpMessage<?> message) {
    return reader(message.getContent(), message.getContentEncoding());
  }

  /**
   * @return an {@link Supplier} containing the object converted to a UTF-8 JSON string.
   */
  public static Supplier asJson(Object obj) {
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    try (JsonOutput out = JSON.newOutput(new OutputStreamWriter(output, UTF_8))) {
      out.writeClassName(false);
      out.write(obj);
    }
    return bytes(output.toByteArray());
  }

  public static <T> T fromJson(HttpMessage<?> message, Type typeOfT) {
    try (Reader reader = reader(message);
        JsonInput input = JSON.newInput(reader)) {
      return input.read(typeOfT);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static String string(File input) throws IOException {
    try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
        InputStream isr = Files.newInputStream(input.toPath())) {
      int len;
      byte[] buffer = new byte[4096];
      while ((len = isr.read(buffer)) != -1) {
        bos.write(buffer, 0, len);
      }
      return Base64.getEncoder().encodeToString(bos.toByteArray());
    }
  }
}
