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

package org.openqa.selenium.bidi.speculation;

import java.util.Map;
import org.openqa.selenium.Beta;

@Beta
public class PrefetchStatusUpdatedParameters {

  private final String context;
  private final String url;
  private final PreloadingStatus status;

  private PrefetchStatusUpdatedParameters(String context, String url, PreloadingStatus status) {
    this.context = context;
    this.url = url;
    this.status = status;
  }

  public static PrefetchStatusUpdatedParameters fromJson(Map<String, Object> params) {
    String context = (String) params.get("context");
    String url = (String) params.get("url");
    String statusStr = (String) params.get("status");
    PreloadingStatus status = PreloadingStatus.fromString(statusStr);

    return new PrefetchStatusUpdatedParameters(context, url, status);
  }

  public String getContext() {
    return context;
  }

  public String getUrl() {
    return url;
  }

  public PreloadingStatus getStatus() {
    return status;
  }
}
