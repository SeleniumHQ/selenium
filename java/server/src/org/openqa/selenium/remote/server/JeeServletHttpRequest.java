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
import java.io.Reader;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;

import static com.google.common.base.Preconditions.checkArgument;

public class JeeServletHttpRequest implements HttpRequest {
  private final HttpServletRequest request;

  public JeeServletHttpRequest(HttpServletRequest request) {
    this.request = Preconditions.checkNotNull(request);
  }

  public String getAppUri() {
    return request.getContextPath() + request.getServletPath();
  }

  public String getUri() {
    return request.getRequestURI();
  }

  public String getMethod() {
    return request.getMethod();
  }

  public String getHeader(String header) {
    return request.getHeader(header);
  }

  public String getPath() {
    return request.getPathInfo();
  }

  public Reader getReader() {
    try {
      return request.getReader();
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  public void forward(HttpResponse response, String to) {
    checkArgument(response instanceof JeeServletHttpResponse);

    RequestDispatcher dispatcher = request.getRequestDispatcher(to);
    try {
      dispatcher.forward(request, ((JeeServletHttpResponse) response).getServletResponse());
    } catch (ServletException e) {
      throw new WebDriverException(e);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  public Object getAttribute(String attributeName) {
    return request.getAttribute(attributeName);
  }

  public void setAttribute(String attributeName, Object value) {
    request.setAttribute(attributeName, value);
  }
}
