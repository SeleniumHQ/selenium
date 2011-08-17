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
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.selenium.remote.server.handler.*;
import org.openqa.selenium.remote.server.handler.html5.ClearAppCache;
import org.openqa.selenium.remote.server.handler.html5.ClearLocalStorage;
import org.openqa.selenium.remote.server.handler.html5.ClearSessionStorage;
import org.openqa.selenium.remote.server.handler.html5.ExecuteSQL;
import org.openqa.selenium.remote.server.handler.html5.GetAppCache;
import org.openqa.selenium.remote.server.handler.html5.GetAppCacheStatus;
import org.openqa.selenium.remote.server.handler.html5.GetLocalStorageItem;
import org.openqa.selenium.remote.server.handler.html5.GetLocalStorageKeys;
import org.openqa.selenium.remote.server.handler.html5.GetLocalStorageSize;
import org.openqa.selenium.remote.server.handler.html5.GetLocationContext;
import org.openqa.selenium.remote.server.handler.html5.GetSessionStorageItem;
import org.openqa.selenium.remote.server.handler.html5.GetSessionStorageKeys;
import org.openqa.selenium.remote.server.handler.html5.GetSessionStorageSize;
import org.openqa.selenium.remote.server.handler.html5.IsBrowserOnline;
import org.openqa.selenium.remote.server.handler.html5.RemoveLocalStorageItem;
import org.openqa.selenium.remote.server.handler.html5.RemoveSessionStorageItem;
import org.openqa.selenium.remote.server.handler.html5.SetBrowserConnection;
import org.openqa.selenium.remote.server.handler.html5.SetLocalStorageItem;
import org.openqa.selenium.remote.server.handler.html5.SetLocationContext;
import org.openqa.selenium.remote.server.handler.html5.SetSessionStorageItem;
import org.openqa.selenium.remote.server.handler.interactions.ClickInSession;
import org.openqa.selenium.remote.server.handler.interactions.DoubleClickInSession;
import org.openqa.selenium.remote.server.handler.interactions.MouseDown;
import org.openqa.selenium.remote.server.handler.interactions.MouseMoveToLocation;
import org.openqa.selenium.remote.server.handler.interactions.MouseUp;
import org.openqa.selenium.remote.server.handler.interactions.SendModifierKey;
import org.openqa.selenium.remote.server.handler.interactions.touch.SingleTapOnElement;
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
  public static final String SESSIONS_KEY = DriverServlet.class.getName() + ".sessions";

  private static final String EXCEPTION = ":exception";
  private static final String RESPONSE = ":response";

  private UrlMapper getMapper;
  private UrlMapper postMapper;
  private UrlMapper deleteMapper;
  private SessionCleaner sessionCleaner;

  @Override
  public void init() throws ServletException {
    super.init();

    Object attribute = getServletContext().getAttribute(SESSIONS_KEY);
    if (attribute == null) {
      attribute = new DefaultDriverSessions();
    }

    DriverSessions driverSessions = (DriverSessions) attribute;

    Logger logger = getLogger();

    setupMappings(driverSessions, logger);

    int sessionTimeOut = Integer.parseInt(System.getProperty("webdriver.server.session.timeout", "1800"));
    if (sessionTimeOut > 0) {
      sessionCleaner = new SessionCleaner((DefaultDriverSessions) attribute, logger, 1000 * sessionTimeOut);
      sessionCleaner.start();
    }
  }

  @Override
  public void destroy() {
    if (sessionCleaner != null) {
      sessionCleaner.stopCleaner();
    }
  }

  protected Logger getLogger() {
    return Logger.getLogger(getClass().getName());
  }

  private void setupMappings(DriverSessions driverSessions, Logger logger) {
    getMapper = new UrlMapper(driverSessions, logger);
    postMapper = new UrlMapper(driverSessions, logger);
    deleteMapper = new UrlMapper(driverSessions, logger);

    getMapper.addGlobalHandler(ResultType.EXCEPTION,
                               new JsonErrorExceptionResult(EXCEPTION, RESPONSE));
    postMapper.addGlobalHandler(ResultType.EXCEPTION,
                                new JsonErrorExceptionResult(EXCEPTION, RESPONSE));
    deleteMapper.addGlobalHandler(ResultType.EXCEPTION,
                                  new JsonErrorExceptionResult(EXCEPTION, RESPONSE));

    postMapper.bind("/config/drivers", AddConfig.class).on(ResultType.SUCCESS, new EmptyResult());

    getMapper.bind("/status", Status.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    postMapper.bind("/session", NewSession.class)
        .on(ResultType.SUCCESS, new RedirectResult("/session/:sessionId"));
    getMapper.bind("/session/:sessionId", GetSessionCapabilities.class)
        .on(ResultType.SUCCESS, new ForwardResult("/WEB-INF/views/sessionCapabilities.jsp"))
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE), "application/json");

    deleteMapper.bind("/session/:sessionId", DeleteSession.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    getMapper.bind("/session/:sessionId/window_handle", GetCurrentWindowHandle.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/window_handles", GetAllWindowHandles.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    postMapper.bind("/session/:sessionId/dismiss_alert", DismissAlert.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/accept_alert", AcceptAlert.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/alert_text", GetAlertText.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/alert_text", SetAlertText.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/url", ChangeUrl.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/url", GetCurrentUrl.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    postMapper.bind("/session/:sessionId/forward", GoForward.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/back", GoBack.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/refresh", RefreshPage.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/execute", ExecuteScript.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/execute_async", ExecuteAsyncScript.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    getMapper.bind("/session/:sessionId/source", GetPageSource.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    getMapper.bind("/session/:sessionId/screenshot", CaptureScreenshot.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    getMapper.bind("/session/:sessionId/title", GetTitle.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    postMapper.bind("/session/:sessionId/element", FindElement.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/element/:id", DescribeElement.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    postMapper.bind("/session/:sessionId/elements", FindElements.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/element/active", FindActiveElement.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    postMapper.bind("/session/:sessionId/element/:id/element", FindChildElement.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/element/:id/elements", FindChildElements.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));


    postMapper.bind("/session/:sessionId/element/:id/click", ClickElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/element/:id/text", GetElementText.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/element/:id/submit", SubmitElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/element/:id/value", SendKeys.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/modifier", SendModifierKey.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/element/:id/value", GetElementValue.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/element/:id/name", GetTagName.class)
    .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    postMapper.bind("/session/:sessionId/element/:id/clear", ClearElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/element/:id/selected", GetElementSelected.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/element/:id/enabled", GetElementEnabled.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/element/:id/displayed", GetElementDisplayed.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/element/:id/location", GetElementLocation.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/element/:id/location_in_view",
        GetElementLocationInView.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/element/:id/size", GetElementSize.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/element/:id/css/:propertyName", GetCssProperty.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    getMapper.bind("/session/:sessionId/element/:id/attribute/:name", GetElementAttribute.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/element/:id/equals/:other", ElementEquality.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    getMapper.bind("/session/:sessionId/cookie", GetAllCookies.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/cookie", AddCookie.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/cookie", DeleteCookie.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/cookie/:name", DeleteNamedCookie.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/frame", SwitchToFrame.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/window", SwitchToWindow.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/window", CloseWindow.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/timeouts/implicit_wait", ImplicitlyWait.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/timeouts/async_script", SetScriptTimeout.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/execute_sql", ExecuteSQL.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    getMapper.bind("/session/:sessionId/location", GetLocationContext.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/location", SetLocationContext.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    getMapper.bind("/session/:sessionId/application_cache", GetAppCache.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/application_cache/status", GetAppCacheStatus.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    deleteMapper.bind("/session/:sessionId/application_cache/clear", ClearAppCache.class)
       .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/browser_connection", SetBrowserConnection.class)
    .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/browser_connection", IsBrowserOnline.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    getMapper.bind("/session/:sessionId/local_storage/:key", GetLocalStorageItem.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    deleteMapper.bind("/session/:sessionId/local_storage/:key", RemoveLocalStorageItem.class)
    .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/local_storage", GetLocalStorageKeys.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/local_storage", SetLocalStorageItem.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/local_storage", ClearLocalStorage.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/local_storage/size", GetLocalStorageSize.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    getMapper.bind("/session/:sessionId/session_storage/:key", GetSessionStorageItem.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    deleteMapper.bind("/session/:sessionId/session_storage/:key", RemoveSessionStorageItem.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/session_storage", GetSessionStorageKeys.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/session_storage", SetSessionStorageItem.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/session_storage", ClearSessionStorage.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/session_storage/size", GetSessionStorageSize.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    getMapper.bind("/session/:sessionId/orientation", GetScreenOrientation.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/orientation", Rotate.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/moveto", MouseMoveToLocation.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/click", ClickInSession.class)
            .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/doubleclick", DoubleClickInSession.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/buttondown", MouseDown.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/buttonup", MouseUp.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    getMapper.bind("/session/:sessionId/ime/available_engines", ImeGetAvailableEngines.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/ime/active_engine", ImeGetActiveEngine.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    getMapper.bind("/session/:sessionId/ime/activated", ImeIsActivated.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/ime/deactivate", ImeDeactivate.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));
    postMapper.bind("/session/:sessionId/ime/activate", ImeActivateEngine.class)
        .on(ResultType.SUCCESS, new JsonResult(RESPONSE));

    // Advanced Touch API
    postMapper.bind("/session/:sessionId/touch/click", SingleTapOnElement.class)
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
      if (config == null) {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      } else {
        config.handle(request.getPathInfo(), request, response);
      }
    } catch (Exception e) {
      log("Fatal, unhandled exception: " + request.getPathInfo() + ": " + e);
      throw new ServletException(e);
    }
  }

}
