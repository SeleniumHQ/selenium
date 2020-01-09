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

package org.openqa.testing;

import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.net.MediaType;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Collection;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.servlet.AsyncContext;
import javax.servlet.DispatcherType;
import javax.servlet.ReadListener;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpUpgradeHandler;
import javax.servlet.http.Part;

public class FakeHttpServletRequest extends HeaderContainer
    implements HttpServletRequest {

  private final UrlInfo requestUrl;
  private final Map<String, Object> attributes;
  private final Map<String, String> parameters;
  private final String method;

  private ServletInputStream inputStream;

  public FakeHttpServletRequest(String method, UrlInfo requestUrl) {
    this.attributes = new HashMap<>();
    this.parameters = new HashMap<>();
    this.method = method.toUpperCase();
    this.requestUrl = requestUrl;
    //Input stream should only be constructed when there's a valid body set from outside.
    this.inputStream = null;
  }

  public void setParameters(Map<String, String> parameters) {
    this.parameters.clear();
    this.parameters.putAll(parameters);
  }

  public void setBody(final String data) {
    this.inputStream = new ServletInputStream() {
      private final ByteArrayInputStream delegate =
          new ByteArrayInputStream(data.getBytes(StandardCharsets.UTF_8));

      @Override
      public void close() throws IOException {
        delegate.close();
      }

      @Override
      public int read() {
        return delegate.read();
      }

      @Override
      public boolean isFinished() {
        return false;
      }

      @Override
      public boolean isReady() {
        return true;
      }

      @Override
      public void setReadListener(ReadListener readListener) {
        throw new UnsupportedOperationException();
      }
    };
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  //  HttpServletRequest methods.
  //
  /////////////////////////////////////////////////////////////////////////////

  @Override
  public String getAuthType() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Cookie[] getCookies() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getMethod() {
    return method;
  }

  @Override
  public String getPathInfo() {
    return requestUrl.getPathInfo();
  }

  @Override
  public String getPathTranslated() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getContextPath() {
    return requestUrl.getContextPath();
  }

  @Override
  public String getQueryString() {
    return requestUrl.getQueryString();
  }

  @Override
  public String getRemoteUser() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isUserInRole(String s) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Principal getUserPrincipal() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getRequestedSessionId() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getRequestURI() {
    return requestUrl.toString();
  }

  @Override
  public StringBuffer getRequestURL() {
    return new StringBuffer(requestUrl.toString());
  }

  @Override
  public String getServletPath() {
    return requestUrl.getServletPath();
  }

  @Override
  public HttpSession getSession(boolean b) {
    throw new UnsupportedOperationException();
  }

  @Override
  public HttpSession getSession() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isRequestedSessionIdValid() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isRequestedSessionIdFromCookie() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isRequestedSessionIdFromURL() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isRequestedSessionIdFromUrl() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Object getAttribute(String s) {
    return attributes.get(s);
  }

  @Override
  public Enumeration<String> getAttributeNames() {
    return Collections.enumeration(attributes.keySet());
  }

  @Override
  public String getCharacterEncoding() {
    try {
      String contentType = getHeader(CONTENT_TYPE);
      if (contentType != null) {
        MediaType mediaType = MediaType.parse(contentType);
        return mediaType.charset().or(UTF_8).toString();
      }
    } catch (IllegalArgumentException ignored) {
      // Do nothing.
    }
    return UTF_8.toString();
  }

  @Override
  public void setCharacterEncoding(String s) {
  throw new UnsupportedOperationException();
  }

  @Override
  public int getContentLength() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getContentType() {
    throw new UnsupportedOperationException();
  }

  @Override
  public ServletInputStream getInputStream() {
    return inputStream;
  }

  @Override
  public Enumeration<String> getHeaders(String name) {
    return Collections.enumeration(getHeaders().get(name.toLowerCase()));
  }

  @Override
  public Enumeration<String> getHeaderNames() {
    return Collections.enumeration(getHeaders().keySet());
  }

  @Override
  public String getParameter(String s) {
    return parameters.get(s);
  }

  @Override
  public Enumeration<String> getParameterNames() {
    return Collections.enumeration(parameters.keySet());
  }

  @Override
  public String[] getParameterValues(String s) {
    Collection<String> values = parameters.values();
    return values.toArray(new String[0]);
  }

  @Override
  @SuppressWarnings({"unchecked", "rawtypes"})
  public Map getParameterMap() {
    return Collections.unmodifiableMap(parameters);
  }

  @Override
  public String getProtocol() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getScheme() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getServerName() {
    throw new UnsupportedOperationException();
  }

  @Override
  public int getServerPort() {
    throw new UnsupportedOperationException();
  }

  @Override
  public BufferedReader getReader() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getRemoteAddr() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getRemoteHost() {
    throw new UnsupportedOperationException();
  }

  @Override
  public void setAttribute(String name, Object value) {
    if (name.startsWith(":")) {
      name = name.substring(1);
    }
    attributes.put(name, value);
  }

  @Override
  public void removeAttribute(String name) {
    if (name.startsWith(":")) {
      name = name.substring(1);
    }
    attributes.remove(name);
  }

  @Override
  public Locale getLocale() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Enumeration<Locale> getLocales() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isSecure() {
    throw new UnsupportedOperationException();
  }

  @Override
  public RequestDispatcher getRequestDispatcher(String s) {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getRealPath(String s) {
    throw new UnsupportedOperationException();
  }

  @Override
  public int getRemotePort() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getLocalName() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getLocalAddr() {
    throw new UnsupportedOperationException();
  }

  @Override
  public int getLocalPort() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String changeSessionId() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean authenticate(HttpServletResponse response) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void login(String username, String password) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void logout() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Collection<Part> getParts() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Part getPart(String name) {
    throw new UnsupportedOperationException();
  }

  @Override
  public <T extends HttpUpgradeHandler> T upgrade(Class<T> handlerClass) {
    throw new UnsupportedOperationException();
  }

  @Override
  public long getContentLengthLong() {
    throw new UnsupportedOperationException();
  }

  @Override
  public ServletContext getServletContext() {
    throw new UnsupportedOperationException();
  }

  @Override
  public AsyncContext startAsync() throws IllegalStateException {
    throw new UnsupportedOperationException();
  }

  @Override
  public AsyncContext startAsync(ServletRequest servletRequest, ServletResponse servletResponse)
    throws IllegalStateException {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isAsyncStarted() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isAsyncSupported() {
    throw new UnsupportedOperationException();
  }

  @Override
  public AsyncContext getAsyncContext() {
    throw new UnsupportedOperationException();
  }

  @Override
  public DispatcherType getDispatcherType() {
    throw new UnsupportedOperationException();
  }
}
