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

package org.openqa.selenium.remote;

import com.google.common.base.Preconditions;

import java.time.Duration;
import java.util.Map;

class InitialHandshakeResponse {
  private final Duration requestDuration;
  private final int httpStatusCode;
  private final Map<?, ?> data;

  public InitialHandshakeResponse(long millis, int statusCode, Map<?, ?> data) {
    this.requestDuration = Duration.ofMillis(millis);
    this.httpStatusCode = statusCode;
    this.data = Preconditions.checkNotNull(data);
  }

  public Duration getRequestDuration() {
    return requestDuration;
  }

  public int getStatusCode() {
    return httpStatusCode;
  }

  public Map<?, ?> getData() {
    return data;
  }
}
