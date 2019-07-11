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

import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.remote.http.Contents.string;

public class HttpResponse extends HttpMessage<HttpResponse> {

  public static final String HTTP_TARGET_HOST = "http.target.host";

  private int status = HTTP_OK;

  public int getStatus() {
    return status;
  }

  public HttpResponse setStatus(int status) {
    this.status = status;
    return this;
  }

  /**
   * Sets the host this response was received from.
   *
   * @param host originating host
   */
  public HttpResponse setTargetHost(String host) {
    setAttribute(HTTP_TARGET_HOST, host);
    return this;
  }

  /**
   * Returns the host this response was received from, or null if it was not set.
   *
   * @return originating host
   */
  public String getTargetHost() {
    return (String) getAttribute(HTTP_TARGET_HOST);
  }

  @Override
  public String toString() {
    return String.format("%s: %s", getStatus(), string(this));
  }
}
