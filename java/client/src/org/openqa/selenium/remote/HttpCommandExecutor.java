/*
Copyright 2007-2014 Software Freedom Conservancy

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

package org.openqa.selenium.remote;

import static com.google.common.base.Preconditions.checkNotNull;
import static org.openqa.selenium.remote.DriverCommand.GET_ALL_SESSIONS;
import static org.openqa.selenium.remote.DriverCommand.NEW_SESSION;
import static org.openqa.selenium.remote.DriverCommand.QUIT;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.NeedsLocalLogs;
import org.openqa.selenium.logging.profiler.HttpProfilerLogEntry;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.JsonHttpCommandCodec;
import org.openqa.selenium.remote.http.JsonHttpResponseCodec;
import org.openqa.selenium.remote.internal.ApacheHttpClient;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

public class HttpCommandExecutor implements CommandExecutor, NeedsLocalLogs {

  private static HttpClient.Factory defaultClientFactory;

  private final URL remoteServer;
  private final HttpClient client;
  private final JsonHttpCommandCodec commandCodec;
  private final JsonHttpResponseCodec responseCodec;

  private LocalLogs logs = LocalLogs.getNullLogger();

  public HttpCommandExecutor(URL addressOfRemoteServer) {
    this(ImmutableMap.<String, CommandInfo>of(), addressOfRemoteServer);
  }

  public HttpCommandExecutor(
      Map<String, CommandInfo> additionalCommands, URL addressOfRemoteServer) {
    this(additionalCommands, addressOfRemoteServer, getDefaultClientFactory());
  }

  public HttpCommandExecutor(
      Map<String, CommandInfo> additionalCommands,
      URL addressOfRemoteServer,
      HttpClient.Factory httpClientFactory) {
    try {
      remoteServer = addressOfRemoteServer == null
          ? new URL(System.getProperty("webdriver.remote.server", "http://localhost:4444/wd/hub"))
          : addressOfRemoteServer;
    } catch (MalformedURLException e) {
      throw new WebDriverException(e);
    }

    commandCodec = new JsonHttpCommandCodec();
    responseCodec = new JsonHttpResponseCodec();
    client = httpClientFactory.createClient(remoteServer);

    for (Map.Entry<String, CommandInfo> entry : additionalCommands.entrySet()) {
      defineCommand(entry.getKey(), entry.getValue());
    }
  }

  private static synchronized HttpClient.Factory getDefaultClientFactory() {
    if (defaultClientFactory == null) {
      defaultClientFactory = new ApacheHttpClient.Factory();
    }
    return defaultClientFactory;
  }

  /**
   * It may be useful to extend the commands understood by this {@code HttpCommandExecutor} at run
   * time, and this can be achieved via this method. Note, this is protected, and expected usage is
   * for subclasses only to call this.
   *
   * @param commandName The name of the command to use.
   */
  protected void defineCommand(String commandName, CommandInfo info) {
    checkNotNull(commandName);
    checkNotNull(info);
    commandCodec.defineCommand(commandName, info.getMethod(), info.getUrl());
  }

  public void setLocalLogs(LocalLogs logs) {
    this.logs = logs;
  }

  private void log(String logType, LogEntry entry) {
    logs.addEntry(logType, entry);
  }

  public URL getAddressOfRemoteServer() {
    return remoteServer;
  }

  public Response execute(Command command) throws IOException {
    if (command.getSessionId() == null) {
      if (QUIT.equals(command.getName())) {
        return new Response();
      }
      if (!GET_ALL_SESSIONS.equals(command.getName())
          && !NEW_SESSION.equals(command.getName())) {
        throw new SessionNotFoundException(
            "Session ID is null. Using WebDriver after calling quit()?");
      }
    }

    HttpRequest httpRequest = commandCodec.encode(command);
    try {
      log(LogType.PROFILER, new HttpProfilerLogEntry(command.getName(), true));
      HttpResponse httpResponse = client.execute(httpRequest, true);
      log(LogType.PROFILER, new HttpProfilerLogEntry(command.getName(), false));

      Response response = responseCodec.decode(httpResponse);
      if (response.getSessionId() == null && httpResponse.getTargetHost() != null) {
        String sessionId = HttpSessionId.getSessionId(httpResponse.getTargetHost());
        response.setSessionId(sessionId);
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
