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

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;

import javax.servlet.ServletException;

public class DisplayHelpHandlerTest {

  private DisplayHelpHandler handler;

  @Before
  public void setUp() {
    handler = new DisplayHelpHandler(new Json(), GridRole.NOT_GRID, "/wd/hub");
  }

  @Test
  public void testGetHelpPageForStandalone() throws IOException {
    assertThat(handler.getHelperType())
        .isEqualTo("Standalone");

    HttpRequest request = new HttpRequest(GET, "/");
    HttpResponse response = new HttpResponse();
    handler.execute(request, response);
    assertThat(response.getStatus()).isEqualTo(HTTP_OK);

    String body = response.getContentString();
    assertThat(body).isNotNull().contains(
        "Whoops! The URL specified routes to this help page.",
        "\"type\": \"Standalone\"",
        "\"consoleLink\": \"\\u002fwd\\u002fhub\"");
  }

  @Test
  public void testGetHelpPageAsset() throws IOException {
    HttpResponse response = new HttpResponse();

    handler.execute(new HttpRequest(GET, "/assets/displayhelpservlet.css"), response);

    assertThat(response.getStatus()).isEqualTo(HTTP_OK);
    assertThat(response.getContentString()).isNotNull().contains("#help-heading #logo");
  }

  @Test
  public void testNoSuchAsset() throws IOException {
    HttpResponse response = new HttpResponse();

    handler.execute(new HttpRequest(GET, "/assets/foo.bar"), response);

    assertThat(response.getStatus()).isEqualTo(HTTP_NOT_FOUND);
  }

  @Test
  public void testAccessRoot() throws IOException {
    HttpResponse response = new HttpResponse();

    handler.execute(new HttpRequest(GET, "/"), response);

    assertThat(response.getStatus()).isEqualTo(HTTP_OK);
  }

}
