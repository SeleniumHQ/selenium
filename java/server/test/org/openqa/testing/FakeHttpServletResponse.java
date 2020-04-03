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

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Collection;
import java.util.Locale;

import javax.servlet.ServletOutputStream;
import javax.servlet.WriteListener;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

public class FakeHttpServletResponse extends HeaderContainer
    implements HttpServletResponse {

  private final StringWriter stringWriter = new StringWriter();
  private final ServletOutputStream servletOutputStream =
      new StringServletOutputStream(stringWriter);
  private final PrintWriter printWriter = new PrintWriter(servletOutputStream);
  private int status = HttpServletResponse.SC_OK;

  @Override
  public int getStatus() {
    return status;
  }

  public String getBody() {
    return stringWriter.toString();
  }

  @Override
  public Collection<String> getHeaders(String name) {
    return getHeaders().get(name);
  }

  @Override
  public Collection<String> getHeaderNames() {
    return getHeaders().keySet();
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  //  HttpServletResponse methods.
  //
  /////////////////////////////////////////////////////////////////////////////

  @Override
  public void addCookie(Cookie cookie) {
    throw new UnsupportedOperationException();
  }

  @Override
  public String encodeURL(String s) {
    throw new UnsupportedOperationException();
  }

  @Override
  public String encodeRedirectURL(String s) {
    throw new UnsupportedOperationException();
  }

  @Override
  public String encodeUrl(String s) {
    throw new UnsupportedOperationException();
  }

  @Override
  public String encodeRedirectUrl(String s) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void sendError(int i, String s) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void sendError(int i) {
    setStatus(i);
  }

  @Override
  public void sendRedirect(String s) {
    setStatus(SC_SEE_OTHER);
    setHeader("Location", s);
  }

  @Override
  public void setStatus(int i) {
    this.status = i;
  }

  @Override
  public void setStatus(int i, String s) {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getCharacterEncoding() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getContentType() {
    return getHeader("Content-Type");
  }

  @Override
  public ServletOutputStream getOutputStream() {
    return servletOutputStream;
  }

  @Override
  public PrintWriter getWriter() {
    return printWriter;
  }

  @Override
  public void setCharacterEncoding(String s) {
    String type = getHeader("content-type");
    setHeader("content-type", type + "; charset=" + s);
  }

  @Override
  public void setContentLength(int i) {
    setIntHeader("content-length", i);
  }

  @Override
  public void setContentLengthLong(long len) {
    setIntHeader("content-length", (int) len);
  }

  @Override
  public void setContentType(String type) {
    setHeader("content-type", type);
  }

  @Override
  public void setBufferSize(int i) {
    throw new UnsupportedOperationException();
  }

  @Override
  public int getBufferSize() {
    throw new UnsupportedOperationException();
  }

  @Override
  public void flushBuffer() {
    // no-op
  }

  @Override
  public void resetBuffer() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isCommitted() {
    throw new UnsupportedOperationException();
  }

  @Override
  public void reset() {
    getHeaders().clear();
  }

  @Override
  public void setLocale(Locale locale) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Locale getLocale() {
    throw new UnsupportedOperationException();
  }

  private static class StringServletOutputStream extends ServletOutputStream {

    private final PrintWriter printWriter;

    private StringServletOutputStream(StringWriter stringWriter) {
      this.printWriter = new PrintWriter(stringWriter);
    }

    @Override
    public void write(int i) {
      printWriter.write(i);
    }

    @Override
    public boolean isReady() {
      return true;
    }

    @Override
    public void setWriteListener(WriteListener writeListener) {
      throw new UnsupportedOperationException();
    }
  }
}
