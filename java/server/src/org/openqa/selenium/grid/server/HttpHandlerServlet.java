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
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;

class HttpHandlerServlet extends HttpServlet {

  private final HttpHandler handler;

  public HttpHandlerServlet(HttpHandler handler) {
    this.handler = Objects.requireNonNull(handler, "Handler to use must be set.");
  }

  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    HttpRequest seReq = new ServletRequestWrappingHttpRequest(req);

    HttpResponse seRes = handler.execute(seReq);

    resp.setStatus(seRes.getStatus());

    seRes.getHeaderNames().forEach(name -> seRes.getHeaders(name).forEach(value -> resp.addHeader(name, value)));

    try (InputStream in = seRes.getContent().get();
         ServletOutputStream out = resp.getOutputStream()) {
      ByteStreams.copy(in, out);
    }
  }
}

