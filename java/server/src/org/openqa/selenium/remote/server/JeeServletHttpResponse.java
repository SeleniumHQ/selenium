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

import com.google.common.base.Preconditions;

import org.openqa.selenium.WebDriverException;

import java.io.IOException;
import java.nio.charset.Charset;

import javax.servlet.http.HttpServletResponse;

public class JeeServletHttpResponse implements HttpResponse {

  private final HttpServletResponse response;

  public JeeServletHttpResponse(HttpServletResponse response) {
    this.response = Preconditions.checkNotNull(response);
  }

  public void setStatus(int status) {
    response.setStatus(status);
  }

  public void setContentType(String mimeType) {
    response.setContentType(mimeType);
  }

  public void setContent(byte[] data) {
    int length = data == null ? 0 : data.length;

    response.setContentLength(length);
    try {
      response.getOutputStream().write(data);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  public void setContent(String message) {
    setContent(message.getBytes());
  }

  public void setEncoding(Charset charset) {
    response.setCharacterEncoding(charset.name());
  }

  public void sendRedirect(String to) {
    try {
      response.sendRedirect(to);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  public void end() {
    try {
      response.flushBuffer();
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  // Go go Gadget "Destroy encapsulation!
  public HttpServletResponse getServletResponse() {
    return response;
  }
}
