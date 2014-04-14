/*
Copyright 2012-2014 Software Freedom Conservancy

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

import static org.openqa.selenium.remote.server.HttpStatusCodes.NOT_FOUND;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.server.handler.AcceptAlert;
import org.openqa.selenium.remote.server.handler.AddConfig;
import org.openqa.selenium.remote.server.handler.AddCookie;
import org.openqa.selenium.remote.server.handler.CaptureScreenshot;
import org.openqa.selenium.remote.server.handler.ChangeUrl;
import org.openqa.selenium.remote.server.handler.ClearElement;
import org.openqa.selenium.remote.server.handler.ClickElement;
import org.openqa.selenium.remote.server.handler.CloseWindow;
import org.openqa.selenium.remote.server.handler.ConfigureTimeout;
import org.openqa.selenium.remote.server.handler.DeleteCookie;
import org.openqa.selenium.remote.server.handler.DeleteNamedCookie;
import org.openqa.selenium.remote.server.handler.DeleteSession;
import org.openqa.selenium.remote.server.handler.DescribeElement;
import org.openqa.selenium.remote.server.handler.DismissAlert;
import org.openqa.selenium.remote.server.handler.ElementEquality;
import org.openqa.selenium.remote.server.handler.ExecuteAsyncScript;
import org.openqa.selenium.remote.server.handler.ExecuteScript;
import org.openqa.selenium.remote.server.handler.FindActiveElement;
import org.openqa.selenium.remote.server.handler.FindChildElement;
import org.openqa.selenium.remote.server.handler.FindChildElements;
import org.openqa.selenium.remote.server.handler.FindElement;
import org.openqa.selenium.remote.server.handler.FindElements;
import org.openqa.selenium.remote.server.handler.GetAlertText;
import org.openqa.selenium.remote.server.handler.GetAllCookies;
import org.openqa.selenium.remote.server.handler.GetAllSessions;
import org.openqa.selenium.remote.server.handler.GetAllWindowHandles;
import org.openqa.selenium.remote.server.handler.GetAvailableLogTypesHandler;
import org.openqa.selenium.remote.server.handler.GetCssProperty;
import org.openqa.selenium.remote.server.handler.GetCurrentUrl;
import org.openqa.selenium.remote.server.handler.GetCurrentWindowHandle;
import org.openqa.selenium.remote.server.handler.GetElementAttribute;
import org.openqa.selenium.remote.server.handler.GetElementDisplayed;
import org.openqa.selenium.remote.server.handler.GetElementEnabled;
import org.openqa.selenium.remote.server.handler.GetElementLocation;
import org.openqa.selenium.remote.server.handler.GetElementLocationInView;
import org.openqa.selenium.remote.server.handler.GetElementSelected;
import org.openqa.selenium.remote.server.handler.GetElementSize;
import org.openqa.selenium.remote.server.handler.GetElementText;
import org.openqa.selenium.remote.server.handler.GetElementValue;
import org.openqa.selenium.remote.server.handler.GetLogHandler;
import org.openqa.selenium.remote.server.handler.GetPageSource;
import org.openqa.selenium.remote.server.handler.GetScreenOrientation;
import org.openqa.selenium.remote.server.handler.GetSessionCapabilities;
import org.openqa.selenium.remote.server.handler.GetSessionLogsHandler;
import org.openqa.selenium.remote.server.handler.GetTagName;
import org.openqa.selenium.remote.server.handler.GetTitle;
import org.openqa.selenium.remote.server.handler.GetWindowPosition;
import org.openqa.selenium.remote.server.handler.GetWindowSize;
import org.openqa.selenium.remote.server.handler.GoBack;
import org.openqa.selenium.remote.server.handler.GoForward;
import org.openqa.selenium.remote.server.handler.ImeActivateEngine;
import org.openqa.selenium.remote.server.handler.ImeDeactivate;
import org.openqa.selenium.remote.server.handler.ImeGetActiveEngine;
import org.openqa.selenium.remote.server.handler.ImeGetAvailableEngines;
import org.openqa.selenium.remote.server.handler.ImeIsActivated;
import org.openqa.selenium.remote.server.handler.ImplicitlyWait;
import org.openqa.selenium.remote.server.handler.MaximizeWindow;
import org.openqa.selenium.remote.server.handler.NewSession;
import org.openqa.selenium.remote.server.handler.RefreshPage;
import org.openqa.selenium.remote.server.handler.Rotate;
import org.openqa.selenium.remote.server.handler.SendKeys;
import org.openqa.selenium.remote.server.handler.SetAlertText;
import org.openqa.selenium.remote.server.handler.SetScriptTimeout;
import org.openqa.selenium.remote.server.handler.SetWindowPosition;
import org.openqa.selenium.remote.server.handler.SetWindowSize;
import org.openqa.selenium.remote.server.handler.Status;
import org.openqa.selenium.remote.server.handler.SubmitElement;
import org.openqa.selenium.remote.server.handler.SwitchToFrame;
import org.openqa.selenium.remote.server.handler.SwitchToParentFrame;
import org.openqa.selenium.remote.server.handler.SwitchToWindow;
import org.openqa.selenium.remote.server.handler.UploadFile;
import org.openqa.selenium.remote.server.handler.html5.ClearLocalStorage;
import org.openqa.selenium.remote.server.handler.html5.ClearSessionStorage;
import org.openqa.selenium.remote.server.handler.html5.ExecuteSQL;
import org.openqa.selenium.remote.server.handler.html5.GetAppCacheStatus;
import org.openqa.selenium.remote.server.handler.html5.GetLocalStorageItem;
import org.openqa.selenium.remote.server.handler.html5.GetLocalStorageKeys;
import org.openqa.selenium.remote.server.handler.html5.GetLocalStorageSize;
import org.openqa.selenium.remote.server.handler.html5.GetLocationContext;
import org.openqa.selenium.remote.server.handler.html5.GetSessionStorageItem;
import org.openqa.selenium.remote.server.handler.html5.GetSessionStorageKeys;
import org.openqa.selenium.remote.server.handler.html5.GetSessionStorageSize;
import org.openqa.selenium.remote.server.handler.html5.RemoveLocalStorageItem;
import org.openqa.selenium.remote.server.handler.html5.RemoveSessionStorageItem;
import org.openqa.selenium.remote.server.handler.html5.SetLocalStorageItem;
import org.openqa.selenium.remote.server.handler.html5.SetLocationContext;
import org.openqa.selenium.remote.server.handler.html5.SetSessionStorageItem;
import org.openqa.selenium.remote.server.handler.interactions.ClickInSession;
import org.openqa.selenium.remote.server.handler.interactions.DoubleClickInSession;
import org.openqa.selenium.remote.server.handler.interactions.MouseDown;
import org.openqa.selenium.remote.server.handler.interactions.MouseMoveToLocation;
import org.openqa.selenium.remote.server.handler.interactions.MouseUp;
import org.openqa.selenium.remote.server.handler.interactions.SendKeyToActiveElement;
import org.openqa.selenium.remote.server.handler.interactions.touch.DoubleTapOnElement;
import org.openqa.selenium.remote.server.handler.interactions.touch.Down;
import org.openqa.selenium.remote.server.handler.interactions.touch.Flick;
import org.openqa.selenium.remote.server.handler.interactions.touch.LongPressOnElement;
import org.openqa.selenium.remote.server.handler.interactions.touch.Move;
import org.openqa.selenium.remote.server.handler.interactions.touch.Scroll;
import org.openqa.selenium.remote.server.handler.interactions.touch.SingleTapOnElement;
import org.openqa.selenium.remote.server.handler.interactions.touch.Up;
import org.openqa.selenium.remote.server.rest.RestishHandler;
import org.openqa.selenium.remote.server.rest.ResultConfig;
import org.openqa.selenium.remote.server.rest.UrlMapper;

import java.util.logging.Logger;

public class JsonHttpRemoteConfig {
  private static final String EXCEPTION = ":exception";
  private static final String RESPONSE = ":response";

  private UrlMapper getMapper;
  private UrlMapper postMapper;
  private UrlMapper deleteMapper;
  private final Logger log;

  public JsonHttpRemoteConfig(DriverSessions sessions, Logger log) {
    this.log = log;
    setUpMappings(sessions, log);
  }

  public void addNewGetMapping(
      String path, Class<? extends RestishHandler<?>> implementationClass) {
    getMapper.bind(path, implementationClass);
  }

  public void addNewPostMapping(
      String path, Class<? extends RestishHandler<?>> implementationClass) {
    postMapper.bind(path, implementationClass);
  }

  public void addNewDeleteMapping(
      String path, Class<? extends RestishHandler<?>> implementationClass) {
    deleteMapper.bind(path, implementationClass);
  }

  public void handleRequest(HttpRequest request, HttpResponse response)
      throws WebDriverException {
    try {
      UrlMapper mapper = getUrlMapper(request.getMethod());
      if (mapper == null) {
        response.setStatus(NOT_FOUND);
        return;
      }

      ResultConfig config = mapper.getConfig(request.getUri());
      if (config == null) {
        response.setStatus(NOT_FOUND);
      } else {
        config.handle(request.getUri(), request, response);
      }
    } catch (Exception e) {
      log.warning("Fatal, unhandled exception: " + request.getUri() + ": " + e);
      throw new WebDriverException(e);
    }
  }

  private UrlMapper getUrlMapper(String method) {
    if ("DELETE".equals(method)) {
      return deleteMapper;
    } else if ("GET".equals(method)) {
      return getMapper;
    } else if ("POST".equals(method)) {
      return postMapper;
    } else {
      throw new IllegalArgumentException("Unknown method: " + method);
    }
  }

  private void setUpMappings(DriverSessions driverSessions, Logger logger) {
    getMapper = new UrlMapper(driverSessions, logger);
    postMapper = new UrlMapper(driverSessions, logger);
    deleteMapper = new UrlMapper(driverSessions, logger);

    postMapper.bind("/config/drivers", AddConfig.class);

    getMapper.bind("/status", Status.class);

    getMapper.bind("/sessions", GetAllSessions.class);

    postMapper.bind("/session", NewSession.class);
    getMapper.bind("/session/:sessionId", GetSessionCapabilities.class);

    deleteMapper.bind("/session/:sessionId", DeleteSession.class);

    getMapper.bind("/session/:sessionId/window_handle", GetCurrentWindowHandle.class);
    getMapper.bind("/session/:sessionId/window_handles", GetAllWindowHandles.class);

    postMapper.bind("/session/:sessionId/dismiss_alert", DismissAlert.class);
    postMapper.bind("/session/:sessionId/accept_alert", AcceptAlert.class);
    getMapper.bind("/session/:sessionId/alert_text", GetAlertText.class);
    postMapper.bind("/session/:sessionId/alert_text", SetAlertText.class);

    postMapper.bind("/session/:sessionId/url", ChangeUrl.class);
    getMapper.bind("/session/:sessionId/url", GetCurrentUrl.class);

    postMapper.bind("/session/:sessionId/forward", GoForward.class);
    postMapper.bind("/session/:sessionId/back", GoBack.class);
    postMapper.bind("/session/:sessionId/refresh", RefreshPage.class);

    postMapper.bind("/session/:sessionId/execute", ExecuteScript.class);
    postMapper.bind("/session/:sessionId/execute_async", ExecuteAsyncScript.class);

    getMapper.bind("/session/:sessionId/source", GetPageSource.class);

    getMapper.bind("/session/:sessionId/screenshot", CaptureScreenshot.class);

    getMapper.bind("/session/:sessionId/title", GetTitle.class);

    postMapper.bind("/session/:sessionId/element", FindElement.class);
    getMapper.bind("/session/:sessionId/element/:id", DescribeElement.class);

    postMapper.bind("/session/:sessionId/elements", FindElements.class);
    postMapper.bind("/session/:sessionId/element/active", FindActiveElement.class);

    postMapper.bind("/session/:sessionId/element/:id/element", FindChildElement.class);
    postMapper.bind("/session/:sessionId/element/:id/elements", FindChildElements.class);


    postMapper.bind("/session/:sessionId/element/:id/click", ClickElement.class);
    getMapper.bind("/session/:sessionId/element/:id/text", GetElementText.class);
    postMapper.bind("/session/:sessionId/element/:id/submit", SubmitElement.class);

    postMapper.bind("/session/:sessionId/file", UploadFile.class);
    postMapper.bind("/session/:sessionId/element/:id/value", SendKeys.class);
    getMapper.bind("/session/:sessionId/element/:id/value", GetElementValue.class);
    getMapper.bind("/session/:sessionId/element/:id/name", GetTagName.class);

    postMapper.bind("/session/:sessionId/element/:id/clear", ClearElement.class);
    getMapper.bind("/session/:sessionId/element/:id/selected", GetElementSelected.class);
    getMapper.bind("/session/:sessionId/element/:id/enabled", GetElementEnabled.class);
    getMapper.bind("/session/:sessionId/element/:id/displayed", GetElementDisplayed.class);
    getMapper.bind("/session/:sessionId/element/:id/location", GetElementLocation.class);
    getMapper.bind("/session/:sessionId/element/:id/location_in_view",
                   GetElementLocationInView.class);
    getMapper.bind("/session/:sessionId/element/:id/size", GetElementSize.class);
    getMapper.bind("/session/:sessionId/element/:id/css/:propertyName", GetCssProperty.class);

    getMapper.bind("/session/:sessionId/element/:id/attribute/:name", GetElementAttribute.class);
    getMapper.bind("/session/:sessionId/element/:id/equals/:other", ElementEquality.class);

    getMapper.bind("/session/:sessionId/cookie", GetAllCookies.class);
    postMapper.bind("/session/:sessionId/cookie", AddCookie.class);
    deleteMapper.bind("/session/:sessionId/cookie", DeleteCookie.class);
    deleteMapper.bind("/session/:sessionId/cookie/:name", DeleteNamedCookie.class);

    postMapper.bind("/session/:sessionId/frame", SwitchToFrame.class);
    postMapper.bind("/session/:sessionId/frame/parent", SwitchToParentFrame.class);
    postMapper.bind("/session/:sessionId/window", SwitchToWindow.class);
    deleteMapper.bind("/session/:sessionId/window", CloseWindow.class);

    getMapper.bind("/session/:sessionId/window/:windowHandle/size", GetWindowSize.class);
    postMapper.bind("/session/:sessionId/window/:windowHandle/size", SetWindowSize.class);
    getMapper.bind("/session/:sessionId/window/:windowHandle/position", GetWindowPosition.class);
    postMapper.bind("/session/:sessionId/window/:windowHandle/position", SetWindowPosition.class);
    postMapper.bind("/session/:sessionId/window/:windowHandle/maximize", MaximizeWindow.class);

    postMapper.bind("/session/:sessionId/timeouts", ConfigureTimeout.class);
    postMapper.bind("/session/:sessionId/timeouts/implicit_wait", ImplicitlyWait.class);
    postMapper.bind("/session/:sessionId/timeouts/async_script", SetScriptTimeout.class);

    postMapper.bind("/session/:sessionId/execute_sql", ExecuteSQL.class);

    getMapper.bind("/session/:sessionId/location", GetLocationContext.class);
    postMapper.bind("/session/:sessionId/location", SetLocationContext.class);

    getMapper.bind("/session/:sessionId/application_cache/status", GetAppCacheStatus.class);

    getMapper.bind("/session/:sessionId/local_storage/key/:key", GetLocalStorageItem.class);
    deleteMapper.bind("/session/:sessionId/local_storage/key/:key", RemoveLocalStorageItem.class);
    getMapper.bind("/session/:sessionId/local_storage", GetLocalStorageKeys.class);
    postMapper.bind("/session/:sessionId/local_storage", SetLocalStorageItem.class);
    deleteMapper.bind("/session/:sessionId/local_storage", ClearLocalStorage.class);
    getMapper.bind("/session/:sessionId/local_storage/size", GetLocalStorageSize.class);

    getMapper.bind("/session/:sessionId/session_storage/key/:key", GetSessionStorageItem.class);
    deleteMapper.bind("/session/:sessionId/session_storage/key/:key",
                      RemoveSessionStorageItem.class);
    getMapper.bind("/session/:sessionId/session_storage", GetSessionStorageKeys.class);
    postMapper.bind("/session/:sessionId/session_storage", SetSessionStorageItem.class);
    deleteMapper.bind("/session/:sessionId/session_storage", ClearSessionStorage.class);
    getMapper.bind("/session/:sessionId/session_storage/size", GetSessionStorageSize.class);

    getMapper.bind("/session/:sessionId/orientation", GetScreenOrientation.class);
    postMapper.bind("/session/:sessionId/orientation", Rotate.class);

    postMapper.bind("/session/:sessionId/moveto", MouseMoveToLocation.class);
    postMapper.bind("/session/:sessionId/click", ClickInSession.class);
    postMapper.bind("/session/:sessionId/doubleclick", DoubleClickInSession.class);
    postMapper.bind("/session/:sessionId/buttondown", MouseDown.class);
    postMapper.bind("/session/:sessionId/buttonup", MouseUp.class);
    postMapper.bind("/session/:sessionId/keys", SendKeyToActiveElement.class);

    getMapper.bind("/session/:sessionId/ime/available_engines", ImeGetAvailableEngines.class);
    getMapper.bind("/session/:sessionId/ime/active_engine", ImeGetActiveEngine.class);
    getMapper.bind("/session/:sessionId/ime/activated", ImeIsActivated.class);
    postMapper.bind("/session/:sessionId/ime/deactivate", ImeDeactivate.class);
    postMapper.bind("/session/:sessionId/ime/activate", ImeActivateEngine.class);

    // Advanced Touch API
    postMapper.bind("/session/:sessionId/touch/click", SingleTapOnElement.class);
    postMapper.bind("/session/:sessionId/touch/down", Down.class);
    postMapper.bind("/session/:sessionId/touch/up", Up.class);
    postMapper.bind("/session/:sessionId/touch/move", Move.class);
    postMapper.bind("/session/:sessionId/touch/scroll", Scroll.class);
    postMapper.bind("/session/:sessionId/touch/doubleclick", DoubleTapOnElement.class);
    postMapper.bind("/session/:sessionId/touch/longclick", LongPressOnElement.class);
    postMapper.bind("/session/:sessionId/touch/flick", Flick.class);

    getMapper.bind("/session/:sessionId/log/types", GetAvailableLogTypesHandler.class);
    postMapper.bind("/session/:sessionId/log", GetLogHandler.class);
    postMapper.bind("/logs", GetSessionLogsHandler.class);
  }
}
