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

package org.openqa.selenium.grid.security;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.net.HttpURLConnection;
import java.util.Base64;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;

public class BasicAuthenticationFilter implements Filter {

  private static final Logger LOG = Logger.getLogger(BasicAuthenticationFilter.class.getName());
  private final String passphrase;

  public BasicAuthenticationFilter(String user, String password) {
    passphrase = Base64.getEncoder().encodeToString((user + ":" + password).getBytes(UTF_8));
  }

  @Override
  public HttpHandler apply(HttpHandler next) {
    return req -> {
      Require.nonNull("Request", req);

      String auth = req.getHeader("Authorization");
      if (!isAuthorized(auth)) {
        if (auth != null) {
          LOG.info("Unauthorized request to " + req);
        }
        return new HttpResponse()
            .setStatus(HttpURLConnection.HTTP_UNAUTHORIZED)
            .addHeader("WWW-Authenticate", "Basic realm=\"selenium-server\"");
      }

      return next.execute(req);
    };
  }

  private boolean isAuthorized(String auth) {
    if (auth != null) {
      final int index = auth.indexOf(' ') + 1;

      if (index > 0) {
        return passphrase.equals(auth.substring(index));
      }
    }

    return false;
  }
}
