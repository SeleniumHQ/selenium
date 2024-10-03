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
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

@Deprecated(forRemoval = true) // should be moved to testing
public class FormEncodedData {

  public static Optional<Map<String, List<String>>> getData(HttpRequest request) {
    try {
      String contentType = request.getHeader("Content-Type");
      if (contentType == null
          || !contentType.split(";")[0].trim().equals("application/x-www-form-urlencoded")) {
        return Optional.empty();
      }
    } catch (IllegalArgumentException | NullPointerException e) {
      return Optional.empty();
    }

    // Maintain ordering of keys.
    Map<String, List<String>> data = new LinkedHashMap<>();
    AtomicBoolean eof = new AtomicBoolean(false);
    Charset encoding = request.getContentEncoding();
    try (InputStream is = request.getContent().get();
        Reader reader = new InputStreamReader(is, request.getContentEncoding())) {

      while (!eof.get()) {
        String key = read(reader, encoding, '=', eof);
        String value = read(reader, encoding, '&', eof);

        data.computeIfAbsent(key, (k) -> new ArrayList<>()).add(value == null ? "" : value);
      }
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    // We want to return a Map<String, List<String>>, not a Map<String, Collection<String>> so, ugh.
    Map<String, List<String>> toReturn = new LinkedHashMap<>();
    for (Map.Entry<String, List<String>> entry : data.entrySet()) {
      toReturn.put(entry.getKey(), List.copyOf(entry.getValue()));
    }
    return Optional.of(Map.copyOf(toReturn));
  }

  private static String read(Reader reader, Charset charSet, char delimiter, AtomicBoolean eof)
      throws IOException {
    if (eof.get()) {
      return null;
    }

    StringBuilder builder = new StringBuilder();
    for (; ; ) {
      int i = reader.read();
      if (i == -1) {
        eof.set(true);
        break;
      }
      char c = (char) i;
      if (c == delimiter) {
        break;
      }
      builder.append(c);
    }

    return URLDecoder.decode(builder.toString(), charSet);
  }
}
