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

import com.google.common.io.ByteStreams;
import com.google.common.io.FileBackedOutputStream;
import org.openqa.selenium.json.Json;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.util.Objects;
import java.util.function.Supplier;

public class Contents {

  private static final Json JSON = new Json();

  private Contents() {
    // Utility class
  }

  public static Supplier<InputStream> empty() {
    return bytes(new byte[0]);
  }

  public static Supplier<InputStream> utf8String(CharSequence value) {
    Objects.requireNonNull(value, "Value to return must be set.");

    return string(value, UTF_8);
  }

  public static Supplier<InputStream> string(CharSequence value, Charset charset) {
    Objects.requireNonNull(value, "Value to return must be set.");
    Objects.requireNonNull(charset, "Character set to use must be set.");

    return bytes(value.toString().getBytes(charset));
  }

  public static Supplier<InputStream> bytes(byte[] bytes) {
    Objects.requireNonNull(bytes, "Bytes to return must be set but may be empty.");

    return () -> new ByteArrayInputStream(bytes);
  }

  public static byte[] bytes(Supplier<InputStream> supplier) {
    Objects.requireNonNull(supplier, "Supplier of input must be set.");

    try (InputStream is = supplier.get();
         ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
      ByteStreams.copy(is, bos);
      return bos.toByteArray();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static String utf8String(Supplier<InputStream> supplier) {
    return string(supplier, UTF_8);
  }

  public static String string(Supplier<InputStream> supplier, Charset charset) {
    Objects.requireNonNull(supplier, "Supplier of input must be set.");
    Objects.requireNonNull(charset, "Character set to use must be set.");

    return new String(bytes(supplier), charset);
  }

  public static String string(HttpMessage<?> message) {
    return string(message.getContent(), message.getContentEncoding());
  }

  public static Reader utf8Reader(Supplier<InputStream> supplier) {
    Objects.requireNonNull(supplier, "Supplier of input must be set.");

    return reader(supplier, UTF_8);
  }

  public static Reader reader(Supplier<InputStream> supplier, Charset charset) {
    Objects.requireNonNull(supplier, "Supplier of input must be set.");
    Objects.requireNonNull(charset, "Character set to use must be set.");

    return new InputStreamReader(supplier.get(), charset);
  }

  public static Reader reader(HttpMessage<?> message) {
    return reader(message.getContent(), message.getContentEncoding());
  }

  /**
   * @return an {@link InputStream} containing the object converted to a UTF-8 JSON string.
   */
  public static Supplier<InputStream> asJson(Object obj) {
    return utf8String(JSON.toJson(obj));
  }

  public static Supplier<InputStream> memoize(Supplier<InputStream> delegate) {
    return new MemoizedSupplier(delegate);
  }

  private static final class MemoizedSupplier implements Supplier<InputStream> {

    private volatile boolean initialized;
    private volatile FileBackedOutputStream fos;
    private Supplier<InputStream> delegate;

    private MemoizedSupplier(Supplier<InputStream> delegate) {
      this.delegate = delegate;
    }

    @Override
    public InputStream get() {
      if (!initialized) {
        synchronized (this) {
          if (!initialized) {
            try (InputStream is = delegate.get()) {
              this.fos = new FileBackedOutputStream(3 * 1024 * 1024, true);
              ByteStreams.copy(is, fos);
              initialized = true;
            } catch (IOException e) {
              throw new UncheckedIOException(e);
            } finally {
              try {
                this.fos.close();
              } catch (IOException e) {
                throw new UncheckedIOException(e);
              }
            }
          }
        }
      }

      try {
        return Objects.requireNonNull(fos.asByteSource()).openBufferedStream();
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    }
  }
}
