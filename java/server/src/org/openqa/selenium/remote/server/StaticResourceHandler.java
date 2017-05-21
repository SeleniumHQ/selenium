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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Strings.nullToEmpty;

import com.google.common.collect.ImmutableMap;
import com.google.common.io.ByteStreams;
import com.google.common.io.Files;
import com.google.common.net.MediaType;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

class StaticResourceHandler {

  private static final ImmutableMap<String, MediaType> MIME_TYPES = ImmutableMap.of(
      "css", MediaType.CSS_UTF_8.withoutParameters(),
      "html", MediaType.HTML_UTF_8.withoutParameters(),
      "js", MediaType.JAVASCRIPT_UTF_8.withoutParameters());

  private static final String STATIC_RESOURCE_BASE_PATH = "/static/resource/";
  private static final String HUB_HTML_PATH = STATIC_RESOURCE_BASE_PATH + "hub.html";

  public boolean isStaticResourceRequest(HttpServletRequest request) {
    return "GET".equalsIgnoreCase(request.getMethod())
           && nullToEmpty(request.getPathInfo()).startsWith(STATIC_RESOURCE_BASE_PATH);
  }

  public void redirectToHub(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    response.sendRedirect(request.getContextPath() + request.getServletPath() + HUB_HTML_PATH);
  }

  public void service(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    checkArgument(isStaticResourceRequest(request));

    String path = String.format(
        "/%s/%s",
        StaticResourceHandler.class.getPackage().getName().replace(".", "/"),
        request.getPathInfo().substring(STATIC_RESOURCE_BASE_PATH.length()));
    URL url = StaticResourceHandler.class.getResource(path);

    if (url == null) {
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    response.setStatus(HttpServletResponse.SC_OK);

    String extension = Files.getFileExtension(path);
    if (MIME_TYPES.containsKey(extension)) {
      response.setContentType(MIME_TYPES.get(extension).toString());
    }

    byte[] data = getResourceData(url);
    response.setContentLength(data.length);

    try (OutputStream output = response.getOutputStream()) {
      output.write(data);
    }
  }

  private byte[] getResourceData(URL url) throws IOException {
    try (InputStream stream = url.openStream()) {
      return ByteStreams.toByteArray(stream);
    }
  }
}
