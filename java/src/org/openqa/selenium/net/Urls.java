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

package org.openqa.selenium.net;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.regex.Pattern;
import org.openqa.selenium.internal.Require;

public class Urls {

  private Urls() {
    // Utility class
  }

  /**
   * Encodes the text as an URL using UTF-8.
   *
   * @param value the text too encode
   * @return the encoded URI string
   * @see URLEncoder#encode(java.lang.String, java.lang.String)
   */
  public static String urlEncode(String value) {
    try {
      return URLEncoder.encode(value, "UTF-8");
    } catch (UnsupportedEncodingException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static URL fromUri(URI uri) {
    try {
      return uri.toURL();
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }
  }

  /**
   * Convert a string, which may just be a hostname, into a valid {@link URI}. If no scheme is
   * given, it is set to {@code http} by default.
   *
   * <p>We prefer to use {@code URI} instead of {@code URL} since the latter requires a scheme
   * handler to be registered for types, so strings like {@code docker://localhost:1234} would not
   * generally be a valid {@link URL} but would be a correct {@link URI}.
   *
   * <p>A known limitation is that URI fragments are not handled. In the expected use cases for this
   * method, that is not a problem.
   */
  public static URI from(String rawUri) {
    Require.nonNull("URL to convert", rawUri);
    try {
      // Things to consider:
      // * A plain string hostname
      // * A host represented as an IPv4 address
      // * A host represented as an IPv6 address
      // * A host represented as an abbreviated IPv6 address

      // If there's no colon, then we have a plain hostname
      int colonIndex = rawUri.indexOf(':');
      int slashIndex = rawUri.indexOf('/');
      if (slashIndex == -1 && colonIndex == -1) {
        return createHttpUri(rawUri);
      }

      // Check the characters preceding the colon. If they're all numbers
      // (or there's no preceding character), we're dealing with a short form
      // ip6 address.
      if (colonIndex != -1) {
        if (colonIndex == 0) {
          return createHttpUri(rawUri);
        }

        if (Pattern.matches("\\d+", rawUri.substring(0, colonIndex))) {
          return createHttpUri(rawUri);
        }
      }

      // If there's a slash immediately after the colon, that's a scheme
      // and we can just create a URI from that.
      return new URI(rawUri);
    } catch (URISyntaxException e) {
      throw new UncheckedIOException(new IOException(e));
    }
  }

  private static URI createHttpUri(String rawHost) {
    int slashIndex = rawHost.indexOf('/');
    String host = slashIndex == -1 ? rawHost : rawHost.substring(0, slashIndex);
    String path = slashIndex == -1 ? null : rawHost.substring(slashIndex);

    try {
      return new URI("http", host, path, null);
    } catch (URISyntaxException e) {
      throw new UncheckedIOException(new IOException(e));
    }
  }
}
