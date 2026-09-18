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

import static java.util.Collections.emptyMap;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.DriverCommand.NEW_SESSION;
import static org.openqa.selenium.remote.DriverCommand.QUIT;
import static org.openqa.selenium.remote.HttpSessionId.getSessionId;

import java.io.Closeable;
import java.io.IOException;
import java.net.URL;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

public class HttpCommandExecutor implements CommandExecutor, Closeable {

  private final URL remoteServer;
  protected final Map<String, CommandInfo> additionalCommands;
  protected final HttpClient client;
  protected @Nullable CommandCodec<HttpRequest> commandCodec;
  protected @Nullable ResponseCodec<HttpResponse> responseCodec;

  @Deprecated(forRemoval = true, since = "4.50.0")
  public static HttpClient.Factory getDefaultClientFactory() {
    return RemoteWebDriver.DEFAULT_CLIENT_FACTORY;
  }

  @Deprecated(forRemoval = true, since = "4.50.0")
  public HttpCommandExecutor(URL addressOfRemoteServer) {
    this(emptyMap(), Require.nonNull("Server URL", addressOfRemoteServer));
  }

  @Deprecated(forRemoval = true, since = "4.50.0")
  public HttpCommandExecutor(ClientConfig config) {
    this(
        emptyMap(),
        Require.nonNull("HTTP client configuration", config),
        HttpClient.Factory.createDefault());
  }

  /**
   * Creates an {@link HttpCommandExecutor} that supports only standard commands.
   *
   * @param httpClient the HttpClient to execute commands with
   * @param addressOfRemoteServer URL of remote end Selenium server
   */
  public HttpCommandExecutor(HttpClient httpClient, URL addressOfRemoteServer) {
    this(httpClient, Map.of(), addressOfRemoteServer);
  }

  /**
   * Creates an {@link HttpCommandExecutor} that supports non-standard {@code additionalCommands} in
   * addition to the standard.
   *
   * @param httpClient the HttpClient to execute commands with
   * @param additionalCommands additional commands to allow the command executor to process
   * @param addressOfRemoteServer URL of remote end Selenium server
   */
  public HttpCommandExecutor(
      HttpClient httpClient,
      Map<String, CommandInfo> additionalCommands,
      URL addressOfRemoteServer) {
    this.client = httpClient;
    this.additionalCommands =
        new HashMap<>(Require.nonNull("Additional commands", additionalCommands));
    this.remoteServer = addressOfRemoteServer;
  }

  /**
   * Creates an {@link HttpCommandExecutor} that supports non-standard {@code additionalCommands} in
   * addition to the standard.
   *
   * @param additionalCommands additional commands to allow the command executor to process
   * @param addressOfRemoteServer URL of remote end Selenium server
   */
  @Deprecated(forRemoval = true, since = "4.50.0")
  public HttpCommandExecutor(
      Map<String, CommandInfo> additionalCommands, URL addressOfRemoteServer) {
    this(
        Require.nonNull("Additional commands", additionalCommands),
        Require.nonNull("Server URL", addressOfRemoteServer),
        HttpClient.Factory.createDefault());
  }

  @Deprecated(forRemoval = true, since = "4.50.0")
  public HttpCommandExecutor(
      Map<String, CommandInfo> additionalCommands, URL addressOfRemoteServer, ClientConfig config) {
    this(
        additionalCommands,
        config.baseUrl(Require.nonNull("Server URL", addressOfRemoteServer)),
        HttpClient.Factory.createDefault());
  }

  @Deprecated(forRemoval = true, since = "4.50.0")
  public HttpCommandExecutor(
      Map<String, CommandInfo> additionalCommands,
      URL addressOfRemoteServer,
      HttpClient.Factory httpClientFactory) {
    this(
        additionalCommands,
        ClientConfig.defaultConfig().baseUrl(Require.nonNull("Server URL", addressOfRemoteServer)),
        httpClientFactory);
  }

  @Deprecated(forRemoval = true, since = "4.50.0")
  public HttpCommandExecutor(
      Map<String, CommandInfo> additionalCommands,
      ClientConfig config,
      HttpClient.Factory httpClientFactory) {
    this(httpClientFactory.createClient(config), additionalCommands, config.baseUrl());
  }

  /**
   * Returns an immutable view of the additional commands.
   *
   * @return an unmodifiable map of additional commands.
   */
  public Map<String, CommandInfo> getAdditionalCommands() {
    return Collections.unmodifiableMap(additionalCommands);
  }

  /**
   * Adds or updates additional commands. This method is protected to allow subclasses to define
   * their commands.
   *
   * @param commandName the name of the command to add or update.
   * @param info the CommandInfo for the command.
   */
  protected void addAdditionalCommand(String commandName, CommandInfo info) {
    Require.nonNull("Command name", commandName);
    Require.nonNull("Command info", info);
    this.additionalCommands.put(commandName, info);
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

  @Deprecated(forRemoval = true, since = "4.50.0")
  public URL getAddressOfRemoteServer() {
    return remoteServer;
  }

  @Override
  public Response execute(Command command) throws IOException {
    if (command.getSessionId() == null) {
      if (QUIT.equals(command.getName())) {
        return new Response();
      }
      if (!NEW_SESSION.equals(command.getName())) {
        throw new NoSuchSessionException(
            "Session ID is null. Using WebDriver after calling quit()?");
      }
    }

    if (NEW_SESSION.equals(command.getName())) {
      if (commandCodec != null) {
        throw new SessionNotCreatedException("Session already exists");
      }
      ProtocolHandshake handshake = new ProtocolHandshake();
      ProtocolHandshake.Result result = handshake.createSession(client, command);
      Dialect dialect = result.getDialect();
      commandCodec = dialect.getCommandCodec();
      for (Map.Entry<String, CommandInfo> entry : additionalCommands.entrySet()) {
        defineCommand(entry.getKey(), entry.getValue());
      }
      responseCodec = dialect.getResponseCodec();
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
      HttpResponse httpResponse = client.execute(httpRequest);

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
      }
      return response;
    } catch (UnsupportedCommandException e) {
      if (e.getMessage() == null || "".equals(e.getMessage())) {
        throw new UnsupportedOperationException(
            "No information from server. Command name was: " + command.getName(), e.getCause());
      }
      throw e;
    }
  }

  @Override
  public void close() {
    client.close();
  }
}
