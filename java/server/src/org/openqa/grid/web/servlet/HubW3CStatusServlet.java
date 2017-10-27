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

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.ErrorCodes.SUCCESS;

import com.google.common.collect.ImmutableMap;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.remote.BeanToJsonConverter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Responds to the WebDriver status request to indicate whether or not the hub is ready to respond.
 */
public class HubW3CStatusServlet extends HttpServlet {

  private final Registry registry;

  public HubW3CStatusServlet(Registry registry) {
    this.registry = Objects.requireNonNull(registry);
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    List<RemoteProxy> allProxies = registry.getAllProxies().getSorted();
    List<RemoteProxy> busyProxies = allProxies.parallelStream()
        .filter(proxy -> proxy.getMaxNumberOfConcurrentTestSessions() - proxy.getTotalUsed() <= 0)
        .collect(Collectors.toList());

    ImmutableMap.Builder<String, Object> value = ImmutableMap.builder();

    // W3C spec
    boolean availableProxies = allProxies.size() > busyProxies.size();
    value.put("ready", availableProxies);
    value.put("message", availableProxies ? "Hub has capacity" : "No spare hub capacity" );

    BuildInfo buildInfo = new BuildInfo();
    value.put("build", ImmutableMap.of(
        // We need to fix the BuildInfo to properly fill out these values.
        "revision", buildInfo.getBuildRevision(),
        "time", buildInfo.getBuildTime(),
        "version", buildInfo.getReleaseLabel()));

    value.put("os", ImmutableMap.of(
        "arch", System.getProperty("os.arch"),
        "name", System.getProperty("os.name"),
        "version", System.getProperty("os.version")));

    value.put("java", ImmutableMap.of("version", System.getProperty("java.version")));

    Map<String, Object> payloadObj = ImmutableMap.of(
        "status", SUCCESS,
        "value", value.build());

    // Write out a minimal W3C status response.
    byte[] payload = new BeanToJsonConverter().convert(payloadObj).getBytes(UTF_8);

    resp.setStatus(HTTP_OK);
    resp.setHeader("Content-Type", JSON_UTF_8.toString());
    resp.setHeader("Content-Length", String.valueOf(payload.length));

    try (ServletOutputStream out = resp.getOutputStream()) {
      out.write(payload);
    }
  }
}
