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

import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.io.ByteStreams;
import com.google.common.net.MediaType;

import org.openqa.grid.common.GridRole;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

/**
 * Displays a somewhat useful help signpost page. Expects {@link #HELPER_TYPE_PARAMETER} to be
 * set as a servlet context init parameter with a value of "hub", "node", or "standalone"
 */
public class DisplayHelpHandler implements CommandHandler {

  public static final String HELPER_TYPE_PARAMETER = "webdriver.server.displayhelpservlet.type";

  private static final String HELPER_SERVLET_TEMPLATE = "displayhelpservlet.html";
  private static final String HELPER_SERVLET_ASSET_PATH_PREFIX = "/assets/";
  private static final String HELPER_SERVLET_RESOURCE_PATH = "org/openqa/grid/images/";
  private static final String HELPER_SERVLET_TEMPLATE_CONFIG_JSON_VAR = "${servletConfigJson}";

  private final Json json;
  private final GridRole role;
  private final String consolePath;
  private final DisplayHelpServletConfig servletConfig;

  public DisplayHelpHandler(Json json, GridRole role, String consolePath) {
    this.json = Objects.requireNonNull(json);
    this.role = Objects.requireNonNull(role);
    this.consolePath = Objects.requireNonNull(consolePath);

    this.servletConfig = new DisplayHelpServletConfig(
        new BuildInfo().getReleaseLabel(),
        getHelperType(),
        consolePath);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    String resource = req.getUri();
    if (resource.contains(HELPER_SERVLET_ASSET_PATH_PREFIX) &&
        !resource.replace(HELPER_SERVLET_ASSET_PATH_PREFIX, "").contains("/") &&
        !resource.replace(HELPER_SERVLET_ASSET_PATH_PREFIX, "").equals("")) {
      // request is for an asset of the help page
      resource = resource.replace(HELPER_SERVLET_ASSET_PATH_PREFIX, "");
      try (InputStream in = getResourceInputStream(resource)) {
        if (in == null) {
          resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
          return;
        } else {
          resp.setStatus(HttpServletResponse.SC_OK);
          resp.setContent(ByteStreams.toByteArray(in));
          return;
        }
      }
    } else {
      // request is for an unknown entity. show the help page
      try (InputStream in = getResourceInputStream(HELPER_SERVLET_TEMPLATE)) {
        if (in == null) {
          resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        } else {
          StringBuilder jsonBuilder = new StringBuilder();
          try (JsonOutput out = json.newOutput(jsonBuilder)) {
            out.setPrettyPrint(false).write(servletConfig);
          }

          final String json = jsonBuilder.toString();

          final String htmlTemplate =
              new BufferedReader(new InputStreamReader(in, UTF_8)).lines()
                  .collect(Collectors.joining("\n"));
          final String updatedTemplate =
              htmlTemplate.replace(HELPER_SERVLET_TEMPLATE_CONFIG_JSON_VAR, json);
          if (resource.equals("/")) {
            resp.setStatus(HttpServletResponse.SC_OK);
          } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
          }

          resp.setHeader("Content-Type", MediaType.HTML_UTF_8.toString());
          resp.setContent(updatedTemplate.getBytes(UTF_8));
        }
      }
    }
  }

  private String getHelperType() {
    switch (role) {
      case HUB: {
        return "Grid Hub";
      }
      case NODE: {
        return "Grid Node";
      }
      default: {
        return "Standalone";
      }
    }
  }

  private InputStream getResourceInputStream(String resource) {
    InputStream in = Thread.currentThread().getContextClassLoader()
        .getResourceAsStream(HELPER_SERVLET_RESOURCE_PATH + resource);
    if (in == null) {
      return null;
    }
    return in;
  }

  private final class DisplayHelpServletConfig {

    private final String version;
    private final String type;
    private final String consoleLink;

    public DisplayHelpServletConfig(String version, String type, String consoleLink) {
      this.version = Objects.requireNonNull(version);
      this.type = Objects.requireNonNull(type);
      this.consoleLink = Objects.requireNonNull(consoleLink);
    }

    public String getVersion() {
      return version;
    }

    public String getType() {
      return type;
    }

    public String getConsoleLink() {
      return consoleLink;
    }
  }
}
