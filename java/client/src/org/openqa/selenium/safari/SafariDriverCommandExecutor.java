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

package org.openqa.selenium.safari;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.Charsets;
import com.google.common.base.Stopwatch;
import com.google.common.base.Throwables;
import com.google.common.io.Files;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.JsonException;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.UnreachableBrowserException;

import java.io.File;
import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

/**
 * A CommandExecutor that communicates with the SafariDriver extension using
 * WebSockets.
 */
class SafariDriverCommandExecutor implements CommandExecutor {

  private static final Logger log = Logger.getLogger(SafariDriverCommandExecutor.class.getName());

  private final SafariDriverServer server;
  private final SafariLocator browserLocator;
  private final SessionData sessionData;
  private final boolean cleanSession;

  private CommandLine commandLine;
  private WebSocketConnection connection;

  /**
   * @param options The {@link SafariOptions} instance
   */
  SafariDriverCommandExecutor(SafariOptions options) {
    this.server = new SafariDriverServer(options.getPort());
    this.browserLocator = new SafariLocator();
    this.sessionData = SessionData.forCurrentPlatform();
    this.cleanSession = options.getUseCleanSession();
  }

  /**
   * Launches a {@link SafariDriverServer}, opens Safari, and requests that
   * Safari connect to the server.
   *
   * @throws IOException If an error occurs while launching Safari.
   */
  synchronized void start() throws IOException {
    if (commandLine != null) {
      return;
    }

    server.start();

    if (cleanSession) {
      sessionData.clear();
    }

    File connectFile = prepareConnectFile(server.getUri());
//    BrowserInstallation installation = browserLocator.findBrowserLocationOrFail();

    // Older versions of Safari could open a URL from the command line using "Safari -url $URL",
    // but this does not work on the latest versions (5.1.3). On Mac OS X, we can use
    // "open -a Safari $URL", but we need a cross platform solution. So, we generate a simple
    // HTML file that redirects to the base of our SafariDriverServer, which kicks off the
    // connection sequence.
    log.info("Launching Safari");
    commandLine = new CommandLine(browserLocator.launcherFilePath(), connectFile.getAbsolutePath());
    commandLine.executeAsync();

    Stopwatch stopwatch = Stopwatch.createStarted();
    try {
      log.info("Waiting for SafariDriver to connect");
      connection = server.getConnection(10, TimeUnit.SECONDS);
    } catch (InterruptedException ignored) {
      // Do nothing.
    }

    if (connection == null) {
      stop();
      throw new UnreachableBrowserException(String.format(
          "Failed to connect to SafariDriver after %d ms",
          stopwatch.elapsed(TimeUnit.MILLISECONDS)));
    }
    log.info(String.format("Driver connected in %d ms", stopwatch.elapsed(TimeUnit.MILLISECONDS)));
  }

  private File prepareConnectFile(String serverUri) throws IOException {
    File tmpDir = TemporaryFilesystem.getDefaultTmpFS()
        .createTempDir("anonymous", "safaridriver");
    File launchFile = new File(tmpDir, "connect.html");
    launchFile.deleteOnExit();

    String contents = String.format(
        "<!DOCTYPE html><script>window.location = '%s';</script>", serverUri);
    Files.write(contents, launchFile, Charsets.UTF_8);

    return launchFile;
  }

  /**
   * Shuts down this executor, killing Safari and the SafariDriverServer along
   * with it.
   */
  synchronized void stop() {
    log.info("Shutting down");
    if (connection != null) {
      log.info("Closing connection");
      connection.close();
      connection = null;
    }

    if (commandLine != null) {
      log.info("Stopping Safari");
      commandLine.destroy();
      commandLine = null;
    }

    log.info("Stopping server");
    server.stop();
    log.info("Shutdown complete");
  }

  @Override
  public synchronized Response execute(Command command) {
    if (!server.isRunning() && DriverCommand.QUIT.equals(command.getName())) {
      Response itsOkToQuitMultipleTimes = new Response();
      itsOkToQuitMultipleTimes.setStatus(ErrorCodes.SUCCESS);
      return itsOkToQuitMultipleTimes;
    }

    checkState(connection != null, "Executor has not been started yet");

    // On quit(), the SafariDriver's browser extension simply returns a stub success
    // response, so we can short-circuit the process and just return that here.
    // The SafarIDriver's browser extension doesn't do anything on qu
    // There's no need to wait for a response when quitting.
    if (DriverCommand.QUIT.equals(command.getName())) {
      Response response = new Response(command.getSessionId());
      response.setStatus(ErrorCodes.SUCCESS);
      response.setState(ErrorCodes.SUCCESS_STRING);
      return response;
    }

    try {
      SafariCommand safariCommand = new SafariCommand(command);
      String rawJsonCommand = new BeanToJsonConverter().convert(serialize(safariCommand));
      ListenableFuture<String> futureResponse = connection.send(rawJsonCommand);

      JsonObject jsonResponse = new JsonParser().parse(futureResponse.get()).getAsJsonObject();
      Response response = new JsonToBeanConverter().convert(
          Response.class, jsonResponse.get("response"));
      if (response.getStatus() == ErrorCodes.SUCCESS) {
        checkArgument(
            safariCommand.getId().equals(jsonResponse.get("id").getAsString()),
            "Response ID<%s> does not match command ID<%s>",
            jsonResponse.get("id").getAsString(), safariCommand.getId());
      }

      return response;
    } catch (JsonSyntaxException e) {
      throw new JsonException(e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new WebDriverException(e);
    } catch (ExecutionException e) {
      throw Throwables.propagate(e.getCause());
    }
  }

  private static JsonElement serialize(SafariCommand command) {
    JsonObject rawJsonCommand = new BeanToJsonConverter().convertObject(command).getAsJsonObject();
    JsonObject serialized = new JsonObject();
    serialized.addProperty("origin", "webdriver");
    serialized.addProperty("type", "command");
    serialized.add("command", rawJsonCommand);
    return serialized;
  }

  /**
   * Extends the standard Command object to include an ID field. Used to
   * synchronize messages with the SafariDriver browser extension.
   */
  private static class SafariCommand extends Command {

    private final UUID id;

    private SafariCommand(Command command) {
      super(command.getSessionId(), command.getName(), command.getParameters());
      this.id = UUID.randomUUID();
    }

    public String getId() {
      return id.toString();
    }
  }
}
