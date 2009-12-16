/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.remote.server;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.selenium.remote.server.handler.AddConfig;
import org.openqa.selenium.remote.server.handler.AddCookie;
import org.openqa.selenium.remote.server.handler.ChangeUrl;
import org.openqa.selenium.remote.server.handler.ClearElement;
import org.openqa.selenium.remote.server.handler.ClickElement;
import org.openqa.selenium.remote.server.handler.CloseWindow;
import org.openqa.selenium.remote.server.handler.DeleteCookie;
import org.openqa.selenium.remote.server.handler.DeleteNamedCookie;
import org.openqa.selenium.remote.server.handler.DeleteSession;
import org.openqa.selenium.remote.server.handler.DescribeElement;
import org.openqa.selenium.remote.server.handler.DragElement;
import org.openqa.selenium.remote.server.handler.ExecuteScript;
import org.openqa.selenium.remote.server.handler.FindActiveElement;
import org.openqa.selenium.remote.server.handler.FindChildElement;
import org.openqa.selenium.remote.server.handler.FindChildElements;
import org.openqa.selenium.remote.server.handler.FindElement;
import org.openqa.selenium.remote.server.handler.FindElements;
import org.openqa.selenium.remote.server.handler.GetAllCookies;
import org.openqa.selenium.remote.server.handler.GetAllWindowHandles;
import org.openqa.selenium.remote.server.handler.GetCssProperty;
import org.openqa.selenium.remote.server.handler.GetCurrentUrl;
import org.openqa.selenium.remote.server.handler.GetCurrentWindowHandle;
import org.openqa.selenium.remote.server.handler.GetElementAttribute;
import org.openqa.selenium.remote.server.handler.GetElementDisplayed;
import org.openqa.selenium.remote.server.handler.GetElementEnabled;
import org.openqa.selenium.remote.server.handler.GetElementLocation;
import org.openqa.selenium.remote.server.handler.GetElementSelected;
import org.openqa.selenium.remote.server.handler.GetElementSize;
import org.openqa.selenium.remote.server.handler.GetElementText;
import org.openqa.selenium.remote.server.handler.GetElementValue;
import org.openqa.selenium.remote.server.handler.GetMouseSpeed;
import org.openqa.selenium.remote.server.handler.GetPageSource;
import org.openqa.selenium.remote.server.handler.GetSessionCapabilities;
import org.openqa.selenium.remote.server.handler.GetTagName;
import org.openqa.selenium.remote.server.handler.GetTitle;
import org.openqa.selenium.remote.server.handler.GoBack;
import org.openqa.selenium.remote.server.handler.GoForward;
import org.openqa.selenium.remote.server.handler.HoverOverElement;
import org.openqa.selenium.remote.server.handler.NewSession;
import org.openqa.selenium.remote.server.handler.RefreshPage;
import org.openqa.selenium.remote.server.handler.SendKeys;
import org.openqa.selenium.remote.server.handler.SetElementSelected;
import org.openqa.selenium.remote.server.handler.SetMouseSpeed;
import org.openqa.selenium.remote.server.handler.SubmitElement;
import org.openqa.selenium.remote.server.handler.SwitchToFrame;
import org.openqa.selenium.remote.server.handler.SwitchToWindow;
import org.openqa.selenium.remote.server.handler.ToggleElement;
import org.openqa.selenium.remote.server.handler.ElementEquality;
import org.openqa.selenium.remote.server.renderer.EmptyResult;
import org.openqa.selenium.remote.server.renderer.ForwardResult;
import org.openqa.selenium.remote.server.renderer.JsonErrorExceptionResult;
import org.openqa.selenium.remote.server.renderer.JsonResult;
import org.openqa.selenium.remote.server.renderer.RedirectResult;
import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.ResultConfig;
import org.openqa.selenium.remote.server.rest.ResultType;
import org.openqa.selenium.remote.server.rest.UrlMapper;

public class DriverServlet extends HttpServlet {
  private UrlMapper getMapper;
  private UrlMapper postMapper;
  private UrlMapper deleteMapper;

  @Override
  public void init() throws ServletException {
    super.init();

    DriverSessions driverSessions = new DriverSessions();

    ServletLogTo logger = new ServletLogTo();

    setupMappings(driverSessions, logger);
  }

  private void setupMappings(DriverSessions driverSessions, ServletLogTo logger) {
    getMapper = new UrlMapper(driverSessions, logger);
    postMapper = new UrlMapper(driverSessions, logger);
    deleteMapper = new UrlMapper(driverSessions, logger);

    getMapper.addGlobalHandler(ResultType.EXCEPTION,
                               new JsonErrorExceptionResult(":exception", ":response"));
    postMapper.addGlobalHandler(ResultType.EXCEPTION,
                                new JsonErrorExceptionResult(":exception", ":response"));
    deleteMapper.addGlobalHandler(ResultType.EXCEPTION,
                                  new JsonErrorExceptionResult(":exception", ":response"));

    postMapper.bind("/config/drivers", AddConfig.class).on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session", NewSession.class)
        .on(ResultType.SUCCESS, new RedirectResult("/session/:sessionId/:context"));
    getMapper.bind("/session/:sessionId/:context", GetSessionCapabilities.class)
        .on(ResultType.SUCCESS, new ForwardResult("/WEB-INF/views/sessionCapabilities.jsp"))
        .on(ResultType.SUCCESS, new JsonResult(":response"), "application/json");

    deleteMapper.bind("/session/:sessionId", DeleteSession.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    getMapper.bind("/session/:sessionId/:context/window_handle", GetCurrentWindowHandle.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/window_handles", GetAllWindowHandles.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/url", ChangeUrl.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/:context/url", GetCurrentUrl.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/forward", GoForward.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/:context/back", GoBack.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/:context/refresh", RefreshPage.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/:context/execute", ExecuteScript.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    getMapper.bind("/session/:sessionId/:context/source", GetPageSource.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    getMapper.bind("/session/:sessionId/:context/title", GetTitle.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/element", FindElement.class).on(
        ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id", DescribeElement.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/elements", FindElements.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    postMapper.
        bind("/session/:sessionId/:context/element/active", FindActiveElement.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/element/:id/element/:using", FindChildElement.class).on(
        ResultType.SUCCESS, new JsonResult(":response"));
    postMapper.bind("/session/:sessionId/:context/element/:id/elements/:using", FindChildElements.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));


    postMapper.bind("/session/:sessionId/:context/element/:id/click", ClickElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/:context/element/:id/text", GetElementText.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    postMapper.bind("/session/:sessionId/:context/element/:id/submit", SubmitElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/:context/element/:id/value", SendKeys.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/:context/element/:id/value", GetElementValue.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/name", GetTagName.class)
    .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/element/:id/clear", ClearElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/:context/element/:id/selected", GetElementSelected.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    postMapper.bind("/session/:sessionId/:context/element/:id/selected", SetElementSelected.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/:context/element/:id/toggle", ToggleElement.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/enabled", GetElementEnabled.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/displayed", GetElementDisplayed.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/location", GetElementLocation.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/size", GetElementSize.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/css/:propertyName", GetCssProperty.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/element/:id/hover", HoverOverElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/:context/element/:id/drag", DragElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    getMapper.bind("/session/:sessionId/:context/element/:id/attribute/:name", GetElementAttribute.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/equals/:other", ElementEquality.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    getMapper.bind("/session/:sessionId/:context/cookie", GetAllCookies.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    postMapper.bind("/session/:sessionId/:context/cookie", AddCookie.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/:context/cookie", DeleteCookie.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/:context/cookie/:name", DeleteNamedCookie.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/:context/frame", SwitchToFrame.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/:context/frame/:id", SwitchToFrame.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/:context/window/:name", SwitchToWindow.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/:context/window", CloseWindow.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    getMapper.bind("/session/:sessionId/:context/speed", GetMouseSpeed.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    postMapper.bind("/session/:sessionId/:context/speed", SetMouseSpeed.class)
        .on(ResultType.SUCCESS, new EmptyResult());
  }

  protected ResultConfig addNewGetMapping(String path, Class<? extends Handler> implementationClass) {
    return getMapper.bind(path, implementationClass);
  }

  protected ResultConfig addNewPostMapping(String path, Class<? extends Handler> implementationClass) {
    return postMapper.bind(path, implementationClass);
  }

  protected ResultConfig addNewDeleteMapping(String path, Class<? extends Handler> implementationClass) {
    return deleteMapper.bind(path, implementationClass);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    handleRequest(getMapper, request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    handleRequest(postMapper, request, response);
  }


  @Override
  protected void doDelete(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    handleRequest(deleteMapper, request, response);
  }

  protected void handleRequest(UrlMapper mapper, HttpServletRequest request,
                               HttpServletResponse response)
      throws ServletException {
    try {
      ResultConfig config = mapper.getConfig(request.getPathInfo());
      config.handle(request.getPathInfo(), request, response);
    } catch (Exception e) {
      log("Fatal, unhandled exception: " + request.getPathInfo() + ": " + e);
      throw new ServletException(e);
    }
  }

  private class ServletLogTo implements LogTo {
    public void log(String message) {
      DriverServlet.this.log(message);
    }
  }
}
