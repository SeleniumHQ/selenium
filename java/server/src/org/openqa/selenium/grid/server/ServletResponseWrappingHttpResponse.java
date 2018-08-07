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

package org.openqa.selenium.grid.server;

import com.google.common.base.Preconditions;
import com.google.common.io.ByteStreams;

import org.openqa.selenium.remote.http.HttpResponse;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.http.HttpServletResponse;

public class ServletResponseWrappingHttpResponse extends HttpResponse {

  private final HttpServletResponse resp;

  public ServletResponseWrappingHttpResponse(HttpServletResponse resp) {
    this.resp = Preconditions.checkNotNull(resp, "Response to wrap must not be null");
  }

  @Override
  public int getStatus() {
    return resp.getStatus();
  }

  @Override
  public void setStatus(int status) {
    resp.setStatus(status);
  }

  @Override
  public Iterable<String> getHeaderNames() {
    return resp.getHeaderNames();
  }

  @Override
  public Iterable<String> getHeaders(String name) {
    return resp.getHeaders(name);
  }

  @Override
  public String getHeader(String name) {
    return resp.getHeader(name);
  }

  @Override
  public void setHeader(String name, String value) {
    resp.setHeader(name, value);
  }

  @Override
  public void addHeader(String name, String value) {
    resp.addHeader(name, value);
  }

  @Override
  public void removeHeader(String name) {
    throw new UnsupportedOperationException("removeHeader");
  }

  @Override
  public void setContent(byte[] data) {
    resp.setContentLength(data.length);
    setContent(new ByteArrayInputStream(data));
  }

  @Override
  public void setContent(InputStream toStreamFrom) {
    try (OutputStream buffered = resp.getOutputStream()) {
      ByteStreams.copy(toStreamFrom, buffered);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public byte[] getContent() {
    throw new UnsupportedOperationException("getContent");
  }

  @Override
  public String getContentString() {
    throw new UnsupportedOperationException("getContentString");
  }

  @Override
  public InputStream consumeContentStream() {
    throw new UnsupportedOperationException("consumeContentStream");
  }
}
