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

package org.openqa.grid.web.servlet;

import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.io.ByteStreams;
import com.google.common.net.MediaType;

import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.Writer;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * API to query all the sessions that are currently running in the hub.
 */
public class NodeSessionsServlet extends RegistryBasedServlet {

  private final Json json = new Json();

  public NodeSessionsServlet() {
    this(null);
  }

  public NodeSessionsServlet(GridRegistry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse rsp) throws IOException {
    process(rsp);
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    if (req.getInputStream() != null) {
      process(resp);
    } else {
      process(resp);
    }
  }

  protected void process(HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);
    Map<String, Object> proxies = new TreeMap<>();
    try (Writer writer = response.getWriter(); JsonOutput out = json.newOutput(writer)) {
      proxies.put("success", true);
      proxies.put("proxies", extractSessionsFromAllProxies());
      out.write(proxies);
    }
  }

  private List<Map<String, Object>> extractSessionsFromAllProxies() {
    List<Map<String, Object>> results = new LinkedList<>();
    List<RemoteProxy> proxies = getRegistry().getAllProxies().getBusyProxies();
    for (RemoteProxy proxy : proxies) {
      Map<String, Object> sessionsInProxy = new TreeMap<>(extractSessionInfo(proxy));
      if (sessionsInProxy.isEmpty()) {
        continue;
      }
      Map<String, Object> res = new TreeMap<>();
      res.put("proxyId", proxy.getId());
      res.put("proxyRemoteHost", proxy.getRemoteHost().toString());
      res.put("sessions", sessionsInProxy);
      results.add(res);
    }
    return results;
  }

  private static Map<String, Object> extractSessionInfo(RemoteProxy proxy) {
    try {
      URL url = proxy.getRemoteHost();
      HttpRequest req = new HttpRequest(HttpMethod.GET, "/wd/hub/sessions");
      HttpResponse rsp = proxy.getHttpClient(url).execute(req);
      try (InputStream in = new ByteArrayInputStream(asBytes(rsp));
           Reader reader = new InputStreamReader(in, getContentEncoding(rsp))) {
        Object body = new Json().newInput(reader).read(Object.class);
        if (body instanceof Map) {
          return (Map<String, Object>) body;
        }
      } catch (JsonException e) {
        // Nothing to do --- poorly formed payload.
      }
    } catch (IOException e) {
      throw new GridException(e.getMessage());
    }
    return new TreeMap<>();
  }

  private static byte[] asBytes(HttpResponse rsp) {
    InputStream stream = rsp.consumeContentStream();
    try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
      ByteStreams.copy(stream, bos);
      return bos.toByteArray();
    } catch (IOException e) {
      throw new GridException(e.getMessage());
    }
  }

  private static Charset getContentEncoding(HttpResponse rsp) {
    Charset charset = UTF_8;
    try {
      String contentType = rsp.getHeader(CONTENT_TYPE);
      if (contentType != null) {
        MediaType mediaType = MediaType.parse(contentType);
        charset = mediaType.charset().or(UTF_8);
      }
    } catch (IllegalArgumentException ignored) {
      // Do nothing.
    }
    return charset;
  }
}
