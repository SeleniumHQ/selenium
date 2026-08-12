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

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;

import java.net.ConnectException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Debug;

public class RetryRequest implements Filter {

  private static final Logger LOG = Logger.getLogger(RetryRequest.class.getName());
  private static final Level LOG_LEVEL = Debug.getDebugLogLevel();

  private static final int RETRIES_ON_CONNECTION_FAILURE = 3;
  private static final int RETRIES_ON_SERVER_ERROR = 2;
  private static final int NEEDED_ATTEMPTS =
      Math.max(RETRIES_ON_CONNECTION_FAILURE, RETRIES_ON_SERVER_ERROR) + 1;

  @Override
  public HttpHandler apply(HttpHandler next) {
    return req -> {
      // start to perform the request in a loop, to allow retries
      for (int i = 0; i < NEEDED_ATTEMPTS; i++) {
        HttpResponse response;

        try {
          response = next.execute(req);
        } catch (RuntimeException ex) {
          // detect a connection failure we would like to retry
          boolean isConnectionFailure = ex.getCause() instanceof ConnectException;

          // must be a connection failure and check whether we have retries left for this
          if (isConnectionFailure && i < RETRIES_ON_CONNECTION_FAILURE) {
            LOG.log(LOG_LEVEL, "Retry #" + (i + 1) + " on ConnectException", ex);
            continue;
          }

          // not a connection failure or retries exceeded, rethrow and let the caller handle this
          throw ex;
        }

        // detect a server error we would like to retry
        boolean isServerError =
            (response.getStatus() == HTTP_INTERNAL_ERROR && response.getContent().length() == 0)
                || response.getStatus() == HTTP_UNAVAILABLE;

        // must be a server error and check whether we have retries left for this
        if (isServerError && i < RETRIES_ON_SERVER_ERROR) {
          LOG.log(LOG_LEVEL, "Retry #" + (i + 1) + " on ServerError: " + response.getStatus());
          continue;
        }

        // not a server error or retries exceeded, return the result to the caller
        return response;
      }

      // This should not be reachable, we either retry or fail before. The only way to get here
      // is to set the static final int fields above to inconsistent values.
      throw new IllegalStateException("Effective unreachable code reached, check constants.");
    };
  }
}
