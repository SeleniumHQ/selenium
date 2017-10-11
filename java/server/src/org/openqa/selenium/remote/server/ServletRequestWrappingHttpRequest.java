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

package org.openqa.selenium.remote.server;

import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;

import javax.servlet.http.HttpServletRequest;

/**
 * Read-only adapter of {@link HttpServletRequest} to a {@link HttpRequest}. This class is not
 * thread-safe, and you can only expect to read the content once.
 */
class ServletRequestWrappingHttpRequest extends HttpRequest {

  private final HttpServletRequest req;

  public ServletRequestWrappingHttpRequest(HttpServletRequest req) {
    super(HttpMethod.valueOf(req.getMethod()), req.getPathInfo() == null ? "/" : req.getPathInfo());

    this.req = req;
  }

  @Override
  public Iterable<String> getHeaderNames() {
    return Collections.list(req.getHeaderNames());
  }

  @Override
  public Iterable<String> getHeaders(String name) {
    return Collections.list(req.getHeaders(name));
  }

  @Override
  public String getHeader(String name) {
    return req.getHeader(name);
  }


  @Override
  public void removeHeader(String name) {
    throw new UnsupportedOperationException("removeHeader");
  }

  @Override
  public void setHeader(String name, String value) {
    throw new UnsupportedOperationException("setHeader");
  }

  @Override
  public void addHeader(String name, String value) {
    throw new UnsupportedOperationException("addHeader");
  }

  @Override
  public void setContent(byte[] data) {
    throw new UnsupportedOperationException("setContent");
  }

  @Override
  public void setContent(InputStream toStreamFrom) {
    throw new UnsupportedOperationException("setContent");
  }

  @Override
  public InputStream consumeContentStream() {
    try {
      return req.getInputStream();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
}
