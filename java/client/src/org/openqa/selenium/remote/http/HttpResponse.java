/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.remote.http;

import static java.net.HttpURLConnection.HTTP_OK;

public class HttpResponse extends HttpMessage {

  public static final String HTTP_TARGET_HOST = "http.target.host";

  private int status = HTTP_OK;

  public int getStatus() {
    return status;
  }

  public void setStatus(int status) {
    this.status = status;
  }

  /**
   * Sets the host this response was received from.
   */
  public void setTargetHost(String host) {
    setAttribute(HTTP_TARGET_HOST, host);
  }

  /**
   * Returns the host this response was received from, or null if it was not set.
   */
  public String getTargetHost() {
    return (String) getAttribute(HTTP_TARGET_HOST);
  }
}
