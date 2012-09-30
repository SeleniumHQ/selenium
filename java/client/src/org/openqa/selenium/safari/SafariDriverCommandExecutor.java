/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.safari;

import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.Charsets;
import com.google.common.base.Stopwatch;
import com.google.common.io.Files;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.browserlaunchers.locators.BrowserLocator;
import org.openqa.selenium.browserlaunchers.locators.SafariLocator;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * A CommandExecutor that communicates with the SafariDriver extension using
 * WebSockets.
 */
class SafariDriverCommandExecutor implements CommandExecutor {

  private final SafariDriverExtension extension;
  private final SafariDriverServer server;
  private final BrowserLocator browserLocator;
  private final SessionData sessionData;
  private final boolean cleanSession;

  private CommandLine commandLine;
  private SafariDriverConnection connection;

  /**
   * @param port The port the {@link SafariDriverServer} should be started on,
   *     or 0 if the server should select a free port.
   * @param cleanSession Whether all system data should be cleared before
   *     starting a new session.
   */
  public SafariDriverCommandExecutor(int port, boolean cleanSession) {
    extension = new SafariDriverExtension();
    server = new SafariDriverServer(port);
    browserLocator = new SafariLocator();
    sessionData = SessionData.forCurrentPlatform();
    this.cleanSession = cleanSession;
  }

  /**
   * Launches a {@link SafariDriverServer}, opens Safari, and requests that
   * Safari connect to the server.
   *
   * @throws IOException If an error occurs while launching Safari.
   */
  public void start() throws IOException {
    if (commandLine != null) {
      return;
    }

    server.start();

    extension.install();
    if (cleanSession) {
      sessionData.clear();
    }

    File connectFile = prepareConnectFile(server.getUri());
    BrowserInstallation installation = browserLocator.findBrowserLocationOrFail();

    // Older versions of Safari could open a URL from the command line using "Safari -url $URL",
    // but this does not work on the latest versions (5.1.3). On Mac OS X, we can use
    // "open -a Safari $URL", but we need a cross platform solution. So, we generate a simple
    // HTML file that redirects to the base of our SafariDriverServer, which kicks off the
    // connection sequence.
    commandLine = new CommandLine(installation.launcherFilePath(), connectFile.getAbsolutePath());
    commandLine.executeAsync();

    Stopwatch stopwatch = new Stopwatch();
    stopwatch.start();
    try {
      connection = server.getConnection(45, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      stop();
      throw new WebDriverException(String.format(
          "Failed to connect to SafariDriver after %d ms",
          stopwatch.elapsedMillis()));
    }
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
  public void stop() {
    if (commandLine != null) {
      commandLine.destroy();
      commandLine = null;
    }
    server.stop();
    connection = null;
  }

  public Response execute(Command command) {
    if (!server.isRunning() && DriverCommand.QUIT.equals(command.getName())) {
      Response itsOkToQuitMultipleTimes = new Response();
      itsOkToQuitMultipleTimes.setStatus(ErrorCodes.SUCCESS);
      return itsOkToQuitMultipleTimes;
    }

    checkState(connection != null, "Executor has not been started yet");
    try {
      return connection.send(command);
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }
}
