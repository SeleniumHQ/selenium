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

import com.google.common.annotations.VisibleForTesting;
import java.io.InputStream;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Debug;
import org.openqa.selenium.internal.Require;

public class DumpHttpExchangeFilter implements Filter {

  public static final Logger LOG = Logger.getLogger(DumpHttpExchangeFilter.class.getName());
  private final Level logLevel;

  public DumpHttpExchangeFilter() {
    this(Debug.getDebugLogLevel());
  }

  public DumpHttpExchangeFilter(Level logLevel) {
    this.logLevel = Require.nonNull("Log level", logLevel);
  }

  @Override
  public HttpHandler apply(HttpHandler next) {
    return req -> {
      // Use the supplier to avoid messing with the request unless we're logging
      LOG.log(logLevel, () -> requestLogMessage(req));

      HttpResponse res = next.execute(req);

      LOG.log(logLevel, () -> responseLogMessage(res));

      return res;
    };
  }

  private void expandHeadersAndContent(StringBuilder builder, HttpMessage<?> message) {
    message.forEachHeader(
        (name, value) -> builder.append("  ").append(name).append(": ").append(value).append("\n"));
    builder.append("\n");
    builder.append(Contents.string(message));
  }

  @VisibleForTesting
  String requestLogMessage(HttpRequest req) {
    // There's no requirement that requests or responses can be read more than once. Protect
    // ourselves.
    Supplier<InputStream> memoized = Contents.memoize(req.getContent());
    req.setContent(memoized);

    StringBuilder reqInfo = new StringBuilder();
    reqInfo.append("HTTP Request: ").append(req).append("\n");
    expandHeadersAndContent(reqInfo, req);
    return reqInfo.toString();
  }

  @VisibleForTesting
  String responseLogMessage(HttpResponse res) {
    Supplier<InputStream> resContents = Contents.memoize(res.getContent());
    res.setContent(resContents);

    StringBuilder resInfo = new StringBuilder("HTTP Response: ");
    resInfo.append("Status code: ").append(res.getStatus()).append("\n");
    expandHeadersAndContent(resInfo, res);
    return resInfo.toString();
  }
}
