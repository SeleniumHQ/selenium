/*
 Copyright 2011 Software Freedom Conservancy.

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

package org.openqa.selenium.remote.server.testing;

import com.google.common.collect.Maps;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.util.Collection;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletInputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

public class FakeHttpServletRequest extends HeaderContainer
    implements HttpServletRequest {

  private final UrlInfo requestUrl;
  private final Map<String, Object> attributes;
  private final Map<String, String> parameters;
  private final String method;

  private BufferedReader reader;

  public FakeHttpServletRequest(String method, UrlInfo requestUrl) {
    this.attributes = Maps.newHashMap();
    this.parameters = Maps.newHashMap();
    this.method = method.toUpperCase();
    this.requestUrl = requestUrl;

    setBody("");
  }
  
  public void setParameters(Map<String, String> parameters) {
    this.parameters.clear();
    this.parameters.putAll(parameters);
  }

  public void setBody(String data) {
    this.reader = new BufferedReader(new StringReader(data));
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  //  HttpServletRequest methods.
  //
  /////////////////////////////////////////////////////////////////////////////

  public String getAuthType() {
    throw new UnsupportedOperationException();
  }

  public Cookie[] getCookies() {
    throw new UnsupportedOperationException();
  }

  public String getMethod() {
    return method;
  }

  public String getPathInfo() {
    return requestUrl.getPathInfo();
  }

  public String getPathTranslated() {
    throw new UnsupportedOperationException();
  }

  public String getContextPath() {
    return requestUrl.getContextPath();
  }

  public String getQueryString() {
    throw new UnsupportedOperationException();
  }

  public String getRemoteUser() {
    throw new UnsupportedOperationException();
  }

  public boolean isUserInRole(String s) {
    throw new UnsupportedOperationException();
  }

  public Principal getUserPrincipal() {
    throw new UnsupportedOperationException();
  }

  public String getRequestedSessionId() {
    throw new UnsupportedOperationException();
  }

  public String getRequestURI() {
    return requestUrl.toString();
  }

  public StringBuffer getRequestURL() {
    return new StringBuffer(requestUrl.toString());
  }

  public String getServletPath() {
    return requestUrl.getServletPath();
  }

  public HttpSession getSession(boolean b) {
    throw new UnsupportedOperationException();
  }

  public HttpSession getSession() {
    throw new UnsupportedOperationException();
  }

  public boolean isRequestedSessionIdValid() {
    throw new UnsupportedOperationException();
  }

  public boolean isRequestedSessionIdFromCookie() {
    throw new UnsupportedOperationException();
  }

  public boolean isRequestedSessionIdFromURL() {
    throw new UnsupportedOperationException();
  }

  public boolean isRequestedSessionIdFromUrl() {
    throw new UnsupportedOperationException();
  }

  public Object getAttribute(String s) {
    return attributes.get(s);
  }

  public Enumeration getAttributeNames() {
    return Collections.enumeration(attributes.keySet());
  }

  public String getCharacterEncoding() {
    throw new UnsupportedOperationException();
  }

  public void setCharacterEncoding(String s) throws UnsupportedEncodingException {
  throw new UnsupportedOperationException();
  }

  public int getContentLength() {
    throw new UnsupportedOperationException();
  }

  public String getContentType() {
    throw new UnsupportedOperationException();
  }

  public ServletInputStream getInputStream() throws IOException {
    throw new UnsupportedOperationException();
  }

  public String getParameter(String s) {
    return parameters.get(s);
  }

  public Enumeration getParameterNames() {
    return Collections.enumeration(parameters.keySet());
  }

  public String[] getParameterValues(String s) {
    Collection<String> values = parameters.values();
    return values.toArray(new String[values.size()]);
  }

  public Map getParameterMap() {
    return Collections.unmodifiableMap(parameters);
  }

  public String getProtocol() {
    throw new UnsupportedOperationException();
  }

  public String getScheme() {
    throw new UnsupportedOperationException();
  }

  public String getServerName() {
    throw new UnsupportedOperationException();
  }

  public int getServerPort() {
    throw new UnsupportedOperationException();
  }

  public BufferedReader getReader() throws IOException {
    return reader;
  }

  public String getRemoteAddr() {
    throw new UnsupportedOperationException();
  }

  public String getRemoteHost() {
    throw new UnsupportedOperationException();
  }

  public void setAttribute(String name, Object value) {
    if (name.startsWith(":")) {
      name = name.substring(1);
    }
    attributes.put(name, value);
  }

  public void removeAttribute(String name) {
    if (name.startsWith(":")) {
      name = name.substring(1);
    }
    attributes.remove(name);
  }

  public Locale getLocale() {
    throw new UnsupportedOperationException();
  }

  public Enumeration getLocales() {
    throw new UnsupportedOperationException();
  }

  public boolean isSecure() {
    throw new UnsupportedOperationException();
  }

  public RequestDispatcher getRequestDispatcher(String s) {
    throw new UnsupportedOperationException();
  }

  public String getRealPath(String s) {
    throw new UnsupportedOperationException();
  }

  public int getRemotePort() {
    throw new UnsupportedOperationException();
  }

  public String getLocalName() {
    throw new UnsupportedOperationException();
  }

  public String getLocalAddr() {
    throw new UnsupportedOperationException();
  }

  public int getLocalPort() {
    throw new UnsupportedOperationException();
  }
}
