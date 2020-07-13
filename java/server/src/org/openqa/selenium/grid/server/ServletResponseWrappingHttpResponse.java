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

import com.google.common.io.ByteStreams;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.function.Supplier;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

class ServletResponseWrappingHttpResponse extends HttpResponse {

  private final HttpServletResponse resp;

  ServletResponseWrappingHttpResponse(HttpServletResponse resp) {
    this.resp = Require.nonNull("Response to wrap", resp);
  }

  @Override
  public int getStatus() {
    return resp.getStatus();
  }

  @Override
  public ServletResponseWrappingHttpResponse setStatus(int status) {
    resp.setStatus(status);
    return this;
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
  public ServletResponseWrappingHttpResponse setHeader(String name, String value) {
    resp.setHeader(name, value);
    return this;
  }

  @Override
  public ServletResponseWrappingHttpResponse addHeader(String name, String value) {
    resp.addHeader(name, value);
    return this;
  }

  @Override
  public ServletResponseWrappingHttpResponse removeHeader(String name) {
    throw new UnsupportedOperationException("removeHeader");
  }

  @Override
  public ServletResponseWrappingHttpResponse setContent(Supplier<InputStream> supplier) {
    byte[] bytes = Contents.bytes(supplier);
    resp.setContentLength(bytes.length);

    try (InputStream is = supplier.get();
         ServletOutputStream os = resp.getOutputStream()) {
      ByteStreams.copy(is, os);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
    return this;
  }

  @Override
  public Supplier<InputStream> getContent() {
    throw new UnsupportedOperationException("getContent");
  }
}
