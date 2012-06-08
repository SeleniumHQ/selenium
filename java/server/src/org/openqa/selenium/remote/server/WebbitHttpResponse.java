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

package org.openqa.selenium.remote.server;

import java.nio.charset.Charset;

public class WebbitHttpResponse implements HttpResponse {

  private final org.webbitserver.HttpResponse response;

  public WebbitHttpResponse(org.webbitserver.HttpResponse response) {
    this.response = response;
  }

  public void setStatus(int status) {
    response.status(status);
  }

  public void setContentType(String mimeType) {
    response.header("Content-Type", mimeType);
  }

  public void setContent(byte[] data) {
    response.content(data);
  }

  public void setContent(String message) {
    response.content(message);
  }

  public void setEncoding(Charset charset) {
    response.charset(charset);
  }

  public void sendRedirect(String to) {
    response.status(HttpStatusCodes.SEE_OTHER);
    response.header("Location", to);
    response.end();
  }

  public void end() {
    response.end();
  }
}
