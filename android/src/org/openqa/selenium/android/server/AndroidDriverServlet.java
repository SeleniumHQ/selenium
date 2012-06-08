/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.android.server;

import org.openqa.selenium.android.server.handler.DragElement;
import org.openqa.selenium.android.server.handler.GetCapabilities;
import org.openqa.selenium.android.server.handler.GetCssProperty;
import org.openqa.selenium.android.server.handler.GetElementDisplayed;
import org.openqa.selenium.android.server.handler.GetElementLocation;
import org.openqa.selenium.android.server.handler.GetElementSize;
import org.openqa.selenium.android.server.handler.HoverOverElement;
import org.openqa.selenium.android.server.handler.NewSession;
import org.openqa.selenium.remote.server.DefaultDriverSessions;
import org.openqa.selenium.remote.server.JsonHttpRemoteConfig;
import org.openqa.selenium.remote.server.WebbitHttpRequest;
import org.openqa.selenium.remote.server.WebbitHttpResponse;
import org.openqa.selenium.remote.server.renderer.EmptyResult;
import org.openqa.selenium.remote.server.renderer.JsonResult;
import org.openqa.selenium.remote.server.renderer.RedirectResult;
import org.openqa.selenium.remote.server.rest.ResultType;
import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;

import java.util.logging.Logger;

public class AndroidDriverServlet implements HttpHandler {
  private final JsonHttpRemoteConfig config;
  private final String basePath;

  public AndroidDriverServlet(Logger log, String basePath) {
    this.basePath = basePath;
    config = new JsonHttpRemoteConfig(new DefaultDriverSessions(), log);

    amend(config);
  }

  private void amend(JsonHttpRemoteConfig config) {
    final EmptyResult emptyResult = new EmptyResult();
    final JsonResult jsonResult = new JsonResult(":response");

    config.addNewGetMapping("/session/:sessionId/element/:id/displayed", GetElementDisplayed.class)
        .on(ResultType.SUCCESS, jsonResult);
    config.addNewGetMapping("/session/:sessionId/element/:id/location", GetElementLocation.class)
        .on(ResultType.SUCCESS, jsonResult);
    config.addNewGetMapping("/session/:sessionId/element/:id/size", GetElementSize.class)
        .on(ResultType.SUCCESS, jsonResult);
    config.addNewGetMapping("/session/:sessionId/element/:id/css/:propertyName", GetCssProperty.class)
        .on(ResultType.SUCCESS, jsonResult);

    config.addNewPostMapping("/session/:sessionId/element/:id/hover", HoverOverElement.class)
        .on(ResultType.SUCCESS, emptyResult);
    config.addNewPostMapping("/session/:sessionId/element/:id/drag", DragElement.class)
        .on(ResultType.SUCCESS, emptyResult);
    config.addNewPostMapping("/session", NewSession.class)
        .on(ResultType.SUCCESS, new RedirectResult("/session/:sessionId"));

    config.addNewGetMapping("/session/:sessionId", GetCapabilities.class)
        .on(ResultType.SUCCESS, jsonResult, "application/json");
  }

  @Override
  public void handleHttpRequest(HttpRequest httpRequest, HttpResponse httpResponse,
                                HttpControl httpControl) throws Exception {

    config.handleRequest(new WebbitHttpRequest(basePath, httpRequest), new WebbitHttpResponse(httpResponse));
  }
}
