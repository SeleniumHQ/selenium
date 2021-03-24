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

package org.openqa.selenium.remote;

import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.NeedsLocalLogs;
import org.openqa.selenium.logging.profiler.HttpProfilerLogEntry;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.net.URL;
import java.util.Map;

import static java.util.Collections.emptyMap;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.DriverCommand.GET_ALL_SESSIONS;
import static org.openqa.selenium.remote.DriverCommand.NEW_SESSION;
import static org.openqa.selenium.remote.DriverCommand.QUIT;
import static org.openqa.selenium.remote.HttpSessionId.getSessionId;

public class HttpCommandExecutor implements CommandExecutor, NeedsLocalLogs {

  private final URL remoteServer;
  private final HttpClient client;
  private final HttpClient.Factory httpClientFactory;
  private final Map<String, CommandInfo> additionalCommands;
  private CommandCodec<HttpRequest> commandCodec;
  private ResponseCodec<HttpResponse> responseCodec;

  private LocalLogs logs = LocalLogs.getNullLogger();

  private static class DefaultClientFactoryHolder {
    static HttpClient.Factory defaultClientFactory = HttpClient.Factory.createDefault();
  }

  public static HttpClient.Factory getDefaultClientFactory() {
    return DefaultClientFactoryHolder.defaultClientFactory;
  }

  public HttpCommandExecutor(URL addressOfRemoteServer) {
    this(emptyMap(), Require.nonNull("Server URL", addressOfRemoteServer));
  }

  public HttpCommandExecutor(ClientConfig config) {
    this(emptyMap(),
      Require.nonNull("HTTP client configuration", config),
      getDefaultClientFactory());
  }

  /**
   * Creates an {@link HttpCommandExecutor} that supports non-standard
   * {@code additionalCommands} in addition to the standard.
   *
   * @param additionalCommands additional commands to allow the command executor to process
   * @param addressOfRemoteServer URL of remote end Selenium server
   */
  public HttpCommandExecutor(
    Map<String, CommandInfo> additionalCommands,
    URL addressOfRemoteServer) {
    this(Require.nonNull("Additional commands", additionalCommands),
      Require.nonNull("Server URL", addressOfRemoteServer),
      getDefaultClientFactory());
  }

  public HttpCommandExecutor(
    Map<String, CommandInfo> additionalCommands,
    URL addressOfRemoteServer,
    HttpClient.Factory httpClientFactory) {
    this(additionalCommands,
         ClientConfig.defaultConfig()
           .baseUrl(Require.nonNull("Server URL", addressOfRemoteServer)),
         httpClientFactory);
  }

  public HttpCommandExecutor(
    Map<String, CommandInfo> additionalCommands,
    ClientConfig config,
    HttpClient.Factory httpClientFactory) {
    remoteServer = Require.nonNull("HTTP client configuration", config).baseUrl();
    this.additionalCommands = Require.nonNull("Additional commands", additionalCommands);
    this.httpClientFactory = Require.nonNull("HTTP client factory", httpClientFactory);
    this.client = this.httpClientFactory.createClient(config);
  }

  /**
   * It may be useful to extend the commands understood by this {@code HttpCommandExecutor} at run
   * time, and this can be achieved via this method. Note, this is protected, and expected usage is
   * for subclasses only to call this.
   *
   * @param commandName The name of the command to use.
   * @param info CommandInfo for the command name provided
   */
  protected void defineCommand(String commandName, CommandInfo info) {
    Require.nonNull("Command name", commandName);
    Require.nonNull("Command info", info);
    commandCodec.defineCommand(commandName, info.getMethod(), info.getUrl());
  }

  @Override
  public void setLocalLogs(LocalLogs logs) {
    this.logs = logs;
  }

  private void log(String logType, LogEntry entry) {
    logs.addEntry(logType, entry);
  }

  public URL getAddressOfRemoteServer() {
    return remoteServer;
  }

  @Override
  public Response execute(Command command) throws IOException {
    if (command.getSessionId() == null) {
      if (QUIT.equals(command.getName())) {
        return new Response();
      }
      if (!GET_ALL_SESSIONS.equals(command.getName())
          && !NEW_SESSION.equals(command.getName())) {
        throw new NoSuchSessionException(
          "Session ID is null. Using WebDriver after calling quit()?");
      }
    }

    if (NEW_SESSION.equals(command.getName())) {
      if (commandCodec != null) {
        throw new SessionNotCreatedException("Session already exists");
      }
      ProtocolHandshake handshake = new ProtocolHandshake();
      log(LogType.PROFILER, new HttpProfilerLogEntry(command.getName(), true));
      ProtocolHandshake.Result result = handshake.createSession(client, command);
      Dialect dialect = result.getDialect();
      commandCodec = dialect.getCommandCodec();
      for (Map.Entry<String, CommandInfo> entry : additionalCommands.entrySet()) {
        defineCommand(entry.getKey(), entry.getValue());
      }
      responseCodec = dialect.getResponseCodec();
      log(LogType.PROFILER, new HttpProfilerLogEntry(command.getName(), false));
      return result.createResponse();
    }

    if (commandCodec == null || responseCodec == null) {
      throw new WebDriverException(
        "No command or response codec has been defined. Unable to proceed");
    }

    HttpRequest httpRequest = commandCodec.encode(command);

    // Ensure that we set the required headers
    if (httpRequest.getHeader("Content-Type") == null) {
      httpRequest.addHeader("Content-Type", JSON_UTF_8);
    }

    try {
      log(LogType.PROFILER, new HttpProfilerLogEntry(command.getName(), true));
      HttpResponse httpResponse = client.execute(httpRequest);
      log(LogType.PROFILER, new HttpProfilerLogEntry(command.getName(), false));

      Response response = responseCodec.decode(httpResponse);
      if (response.getSessionId() == null) {
        if (httpResponse.getTargetHost() != null) {
          response.setSessionId(getSessionId(httpResponse.getTargetHost()).orElse(null));
        } else {
          // Spam in the session id from the request
          response.setSessionId(command.getSessionId().toString());
        }
      }
      if (QUIT.equals(command.getName())) {
        client.close();
        httpClientFactory.cleanupIdleClients();
      }
      return response;
    } catch (UnsupportedCommandException e) {
      if (e.getMessage() == null || "".equals(e.getMessage())) {
        throw new UnsupportedOperationException(
          "No information from server. Command name was: " + command.getName(),
          e.getCause());
      }
      throw e;
    }
  }
}
