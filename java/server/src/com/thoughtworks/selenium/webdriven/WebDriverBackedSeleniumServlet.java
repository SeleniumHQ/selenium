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

import static java.util.concurrent.TimeUnit.MINUTES;

import com.google.common.base.Joiner;
import com.google.common.base.Splitter;

import com.thoughtworks.selenium.CommandProcessor;
import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.ActiveSession;
import org.openqa.selenium.remote.server.ActiveSessionFactory;
import org.openqa.selenium.remote.server.ActiveSessionListener;
import org.openqa.selenium.remote.server.ActiveSessions;
import org.openqa.selenium.remote.server.NewSessionPayload;
import org.openqa.selenium.remote.server.WebDriverServlet;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * An implementation of the original selenium rc server endpoint, using a webdriver-backed selenium
 * in order to get things working.
 */
public class WebDriverBackedSeleniumServlet extends HttpServlet {

  // Prepare the shared set of thingies
  private static final Map<SessionId, CommandProcessor> PROCESSORS = new ConcurrentHashMap<>();

  private ActiveSessions sessions;
  private ActiveSessionListener listener;

  @Override
  public void init() throws ServletException {
    super.init();
    Object attribute = getServletContext().getAttribute(WebDriverServlet.ACTIVE_SESSIONS_KEY);
    if (attribute == null) {
      attribute = new ActiveSessions(5, MINUTES);
    }
    sessions = (ActiveSessions) attribute;

    listener = new ActiveSessionListener() {
      @Override
      public void onStop(ActiveSession session) {
        PROCESSORS.remove(session.getId());
      }
    };
  }

  @Override
  public void destroy() {
    if (listener != null) {
      sessions.removeListener(listener);
    }
    super.destroy();
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException {

    String cmd = req.getParameter("cmd");
    SessionId sessionId = new SessionId(req.getParameter("sessionId"));
    String[] args = deserializeArgs(req);

    if (cmd == null) {
      resp.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    StringBuilder printableArgs = new StringBuilder("[");
    Joiner.on(", ").appendTo(printableArgs, args);
    printableArgs.append("]");
    log( String.format("Command request: %s%s on session %s", cmd, printableArgs, sessionId));

    if ("getNewBrowserSession".equals(cmd)) {
      // Figure out what to do. If the first arg is "*webdriver", check for a session id and use
      // that existing session if present. Otherwise, start a new session with whatever comes to
      // hand. If, however, the first parameter specifies something else, then create a session
      // using a webdriver-backed instance of that.
      startNewSession(resp, args[0], args[1], args.length == 4 ? args[3] : "");
      return;
    } else if ("testComplete".equals(cmd)) {
      CommandProcessor commandProcessor = PROCESSORS.get(sessionId);

      sessions.invalidate(sessionId);

      if (commandProcessor == null) {
        resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
      sendResponse(resp, null);
      return;
    }

    // Common case.
    CommandProcessor commandProcessor = PROCESSORS.get(sessionId);
    if (commandProcessor == null) {
      resp.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    try {
      String result = commandProcessor.doCommand(cmd, args);
      sendResponse(resp, result);
    } catch (SeleniumException e) {
      sendError(resp, e.getMessage());
    }
  }

  private void startNewSession(
    HttpServletResponse resp,
    String browserString,
    String baseUrl,
    String options) throws IOException {
    SessionId sessionId = null;

    if (options.startsWith("webdriver.remote.sessionid")) {
      // We may have a hit
      List<String> split = Splitter.on("=")
        .omitEmptyStrings()
        .trimResults()
        .limit(2)
        .splitToList(options);
      if (!"webdriver.remote.sessionid".equals(split.get(0))) {
        log( "Unable to find existing webdriver session. Wrong parameter name: " + options);
        sendError(
          resp,
          "Unable to find existing webdriver session. Wrong parameter name: " + options);
        return;
      }
      if (split.size() != 2) {
        log("Attempted to find webdriver id, but none specified. Bailing");
        sendError(resp, "Unable to find existing webdriver session. No ID specified");
        return;
      }
      sessionId = new SessionId(split.get(1));
    }

    if (sessionId == null) {
      // Let's see if the user chose "webdriver" or something specific.
      DesiredCapabilities caps;
      switch (browserString) {
        case "*webdriver":
          caps = new DesiredCapabilities();
          break;

        case "*chrome":
        case "*firefox":
        case "*firefoxproxy":
        case "*firefoxchrome":
        case "*pifirefox":
          caps = DesiredCapabilities.firefox();
          break;

        case "*iehta":
        case "*iexplore":
        case "*iexploreproxy":
        case "*piiexplore":
          caps = DesiredCapabilities.internetExplorer();
          break;

        case "*googlechrome":
          caps = DesiredCapabilities.chrome();
          break;

        case "*MicrosoftEdge":
          caps = DesiredCapabilities.edge();
          break;

        case "*opera":
        case "*operablink":
          caps = DesiredCapabilities.operaBlink();
          break;

        case "*safari":
        case "*safariproxy":
          caps = DesiredCapabilities.safari();
          break;

        default:
          sendError(resp, "Unable to match browser string: " + browserString);
          return;
      }

      try {
        try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
          ActiveSession session = new ActiveSessionFactory().createSession(payload);
          sessions.put(session);
          sessionId = session.getId();
        }
      } catch (Exception e) {
        log("Unable to start session", e);
        sendError(
          resp,
          "Unable to start session. Cause can be found in logs. Message is: " + e.getMessage());
        return;
      }
    }

    ActiveSession session = sessions.get(sessionId);
    if (session == null) {
      log("Attempt to use non-existent session: " + sessionId);
      sendError(resp, "Attempt to use non-existent session: " + sessionId);
      return;
    }

    PROCESSORS.put(sessionId, new WebDriverCommandProcessor(baseUrl, session.getWrappedDriver()));

    sendResponse(resp, sessionId.toString());
  }

  private void sendResponse(HttpServletResponse resp, String result) throws IOException {
    resp.setStatus(HttpServletResponse.SC_OK);
    resp.setCharacterEncoding(StandardCharsets.UTF_8.displayName());
    resp.getWriter().append("OK").append(result == null ? "" : "," + result);
    resp.flushBuffer();
  }

  private void sendError(HttpServletResponse resp, String result) throws IOException {
    resp.setStatus(HttpServletResponse.SC_OK);
    resp.setCharacterEncoding(StandardCharsets.UTF_8.displayName());
    resp.getWriter().append("ERROR").append(result == null ? "" : ": " + result);
    resp.flushBuffer();
  }

  private String[] deserializeArgs(HttpServletRequest req) {
    // 5 was picked as the maximum length used by the `start` command
    List<String> args = new ArrayList<>();
    for (int i = 0; i < 5; i++) {
      String value = req.getParameter(String.valueOf(i + 1));
      if (value != null) {
        args.add(value);
      } else {
        break;
      }
    }
    return args.toArray(new String[args.size()]);
  }

}
