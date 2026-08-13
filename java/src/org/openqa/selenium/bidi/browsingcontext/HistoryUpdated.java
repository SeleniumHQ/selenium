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

package org.openqa.selenium.bidi.browsingcontext;

import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;

@Beta
public class HistoryUpdated {

  private final String browsingContextId;

  private final long timestamp;

  private final String url;

  // Constructor parameter names are used as JSON field names.
  private HistoryUpdated(String context, long timestamp, String url) {
    this.browsingContextId = Require.nonNull("browsingContext", context);
    this.timestamp = Require.positive("Timestamp", timestamp);
    this.url = Require.nonNull("URL", url);
  }

  public String getBrowsingContextId() {
    return browsingContextId;
  }

  public long getTimestamp() {
    return timestamp;
  }

  public String getUrl() {
    return url;
  }
}
