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

package com.thoughtworks.selenium.webdriven;

import com.google.common.base.Joiner;
import com.google.common.base.Splitter;
import com.thoughtworks.selenium.CommandProcessor;
import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.ie.InternetExplorerOptions;
import org.openqa.selenium.opera.OperaOptions;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.FormEncodedData;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.server.ActiveSessionFactory;
import org.openqa.selenium.remote.server.ActiveSessionListener;
import org.openqa.selenium.remote.server.ActiveSessions;
import org.openqa.selenium.remote.server.NewSessionPipeline;
import org.openqa.selenium.safari.SafariOptions;

import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.util.concurrent.TimeUnit.MINUTES;
import static java.util.logging.Level.WARNING;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

/**
 * An implementation of the original selenium rc server endpoint, using a webdriver-backed selenium
 * in order to get things working.
 */
public class WebDriverBackedSeleniumHandler implements Routable {

  // Prepare the shared set of thingies
  private static final Map<SessionId, CommandProcessor> PROCESSORS = new ConcurrentHashMap<>();
  public static final Logger LOG = Logger.getLogger(WebDriverBackedSelenium.class.getName());

  private NewSessionPipeline pipeline;
  private ActiveSessions sessions;
  private ActiveSessionListener listener;

  public WebDriverBackedSeleniumHandler(ActiveSessions sessions) {
    this.sessions = sessions == null ? new ActiveSessions(5, MINUTES) : sessions;
    listener = new ActiveSessionListener() {
      @Override
      public void onStop(ActiveSession session) {
        PROCESSORS.remove(session.getId());
      }
    };
    sessions.addListener(listener);

    this.pipeline = NewSessionPipeline.builder().add(new ActiveSessionFactory()).create();
  }

  @Override
  public boolean matches(HttpRequest req) {
    return req.getMethod() == POST &&
           ("/selenium-server/driver/".equals(req.getUri()) ||
            "/selenium-server/driver".equals(req.getUri()));
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    Optional<Map<String, List<String>>> params = FormEncodedData.getData(req);

    String cmd = getValue("cmd", params, req);

    SessionId sessionId = null;
    if (getValue("sessionId", params, req) != null) {
      sessionId = new SessionId(getValue("sessionId", params, req));
    }
    String[] args = deserializeArgs(params, req);

    if (cmd == null) {
      return sendError(HTTP_NOT_FOUND, "Unable to find cmd query parameter");
    }

    StringBuilder printableArgs = new StringBuilder("[");
    Joiner.on(", ").appendTo(printableArgs, args);
    printableArgs.append("]");
    LOG.info(String.format("Command request: %s%s on session %s", cmd, printableArgs, sessionId));

    if ("getNewBrowserSession".equals(cmd)) {
      // Figure out what to do. If the first arg is "*webdriver", check for a session id and use
      // that existing session if present. Otherwise, start a new session with whatever comes to
      // hand. If, however, the first parameter specifies something else, then create a session
      // using a webdriver-backed instance of that.
      return startNewSession(args[0], args[1], args.length == 4 ? args[3] : "");
    } else if ("testComplete".equals(cmd)) {
      CommandProcessor commandProcessor = PROCESSORS.get(sessionId);

      sessions.invalidate(sessionId);

      if (commandProcessor == null) {
        return sendError(HTTP_NOT_FOUND, "Unable to find command processor for " + sessionId);
      }
      return sendResponse(null);
    }

    // Common case.
    CommandProcessor commandProcessor = PROCESSORS.get(sessionId);
    if (commandProcessor == null) {
      return sendError(HTTP_NOT_FOUND, "Unable to find command processor for " + sessionId);
    }
    try {
      String result = commandProcessor.doCommand(cmd, args);
      return sendResponse(result);
    } catch (SeleniumException e) {
      return sendError(HTTP_OK, e.getMessage());
    }
  }

  private HttpResponse startNewSession(
    String browserString,
    String baseUrl,
    String options) {
    SessionId sessionId = null;

    if (options.startsWith("webdriver.remote.sessionid")) {
      // We may have a hit
      List<String> split = Splitter.on("=")
        .omitEmptyStrings()
        .trimResults()
        .limit(2)
        .splitToList(options);
      if (!"webdriver.remote.sessionid".equals(split.get(0))) {
        LOG.warning("Unable to find existing webdriver session. Wrong parameter name: " + options);
        return sendError(
            HTTP_OK,
            "Unable to find existing webdriver session. Wrong parameter name: " + options);
      }
      if (split.size() != 2) {
        LOG.warning("Attempted to find webdriver id, but none specified. Bailing");
        return sendError(
            HTTP_OK,
            "Unable to find existing webdriver session. No ID specified");
      }
      sessionId = new SessionId(split.get(1));
    }

    if (sessionId == null) {
      // Let's see if the user chose "webdriver" or something specific.
      Capabilities caps;
      switch (browserString) {
        case "*webdriver":
          caps = new ImmutableCapabilities();
          break;

        case "*chrome":
        case "*firefox":
        case "*firefoxproxy":
        case "*firefoxchrome":
        case "*pifirefox":
          caps = new FirefoxOptions();
          break;

        case "*iehta":
        case "*iexplore":
        case "*iexploreproxy":
        case "*piiexplore":
          caps = new InternetExplorerOptions();
          break;

        case "*googlechrome":
          caps = new ChromeOptions();
          break;

        case "*MicrosoftEdge":
          caps = new EdgeOptions();
          break;

        case "*opera":
        case "*operablink":
          caps = new OperaOptions();
          break;

        case "*safari":
        case "*safariproxy":
          caps = new SafariOptions();
          break;

        default:
          return sendError(HTTP_OK, "Unable to match browser string: " + browserString);
      }

      try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
        ActiveSession session = pipeline.createNewSession(payload);
        sessions.put(session);
        sessionId = session.getId();
      } catch (Exception e) {
        LOG.log(WARNING, "Unable to start session", e);
        return sendError(
            HTTP_OK,
          "Unable to start session. Cause can be found in logs. Message is: " + e.getMessage());
      }
    }

    ActiveSession session = sessions.get(sessionId);
    if (session == null) {
      LOG.warning("Attempt to use non-existent session: " + sessionId);
      return sendError(HTTP_OK, "Attempt to use non-existent session: " + sessionId);
    }

    PROCESSORS.put(sessionId, new WebDriverCommandProcessor(baseUrl, session.getWrappedDriver()));

    return sendResponse(sessionId.toString());
  }

  private HttpResponse sendResponse(String result) {
    return new HttpResponse()
        .setStatus(HTTP_OK)
        .setHeader("", "")
        .setContent(utf8String("OK".concat(result == null ? "" : "," + result)));
  }

  private HttpResponse sendError(int statusCode, String result) {
    return new HttpResponse()
        .setStatus(statusCode)
        .setHeader("", "")
        .setContent(utf8String("ERROR".concat(result == null ? "" : ": " + result)));
  }

  private String[] deserializeArgs(Optional<Map<String, List<String>>> params, HttpRequest req) {
    // 5 was picked as the maximum length used by the `start` command
    List<String> args = new ArrayList<>();
    for (int i = 0; i < 5; i++) {
      String value = getValue(String.valueOf(i + 1), params, req);
      if (value != null) {
        args.add(value);
      } else {
        break;
      }
    }
    return args.toArray(new String[0]);
  }

  private String getValue(String key, Optional<Map<String, List<String>>> params, HttpRequest request) {
    return params.map(data -> {
      List<String> values = data.getOrDefault(key, new ArrayList<>());
      if (values.isEmpty()) {
        return request.getQueryParameter(key);
      }
      return values.get(0);
    }).orElseGet(() -> request.getQueryParameter(key));
  }
}
