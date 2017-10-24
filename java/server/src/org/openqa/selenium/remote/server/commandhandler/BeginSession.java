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

package org.openqa.selenium.remote.server.commandhandler;

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.ActiveSession;
import org.openqa.selenium.remote.server.ActiveSessionFactory;
import org.openqa.selenium.remote.server.ActiveSessions;
import org.openqa.selenium.remote.server.CommandHandler;
import org.openqa.selenium.remote.server.NewSessionPayload;
import org.openqa.selenium.remote.server.log.LoggingManager;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.logging.Level;

public class BeginSession implements CommandHandler {

  private final ActiveSessionFactory sessionFactory;
  private final ActiveSessions allSessions;

  public BeginSession(ActiveSessions allSessions) {
    this.allSessions = allSessions;
    this.sessionFactory = new ActiveSessionFactory();
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    String lengthString = req.getHeader("Content-Length");
    long contentLength = Long.MAX_VALUE;
    if (lengthString != null) {
      try {
        contentLength = Long.parseLong(lengthString);
      } catch (NumberFormatException e) {
        contentLength = Long.MAX_VALUE;
      }
    }

    ActiveSession session;
    try (Reader reader = new InputStreamReader(
        req.consumeContentStream(),
        req.getContentEncoding());
         NewSessionPayload payload = new NewSessionPayload(contentLength, reader)) {
      session = sessionFactory.createSession(payload);
      allSessions.put(session);
    }

    // Force capture of server-side logs since we don't have easy access to the request from the
    // local end.
    LoggingPreferences loggingPrefs = new LoggingPreferences();
    loggingPrefs.enable(LogType.SERVER, Level.INFO);
    Object raw = session.getCapabilities().get(CapabilityType.LOGGING_PREFS);
    if (raw instanceof LoggingPreferences) {
      loggingPrefs.addPreferences((LoggingPreferences) raw);
    }

    LoggingManager.perSessionLogHandler().configureLogging(loggingPrefs);
    LoggingManager.perSessionLogHandler().attachToCurrentThread(session.getId());

    Object toConvert;
      switch (session.getDownstreamDialect()) {
        case OSS:
          toConvert = ImmutableMap.of(
              "status", 0,
              "sessionId", session.getId().toString(),
              "value", session.getCapabilities());
          break;

        case W3C:
          toConvert = ImmutableMap.of(
              "value", ImmutableMap.of(
                  "sessionId", session.getId().toString(),
                  "capabilities", session.getCapabilities()));
          break;

        default:
          throw new SessionNotCreatedException(
              "Unrecognized downstream dialect: " + session.getDownstreamDialect());
      }

      byte[] payload = new BeanToJsonConverter().convert(toConvert).getBytes(UTF_8);

      resp.setStatus(HTTP_OK);
      resp.setHeader("Cache-Control", "no-cache");

      resp.setHeader("Content-Type", JSON_UTF_8.toString());
      resp.setHeader("Content-Length", String.valueOf(payload.length));

      resp.setContent(payload);
  }
}
