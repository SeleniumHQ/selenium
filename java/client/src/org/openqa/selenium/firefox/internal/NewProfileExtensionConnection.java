/*
Copyright 2007-2010 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.firefox.internal;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.ExtensionConnection;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.firefox.NotConnectedException;
import org.openqa.selenium.internal.Lock;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.NeedsLocalLogs;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.internal.CircularOutputStream;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.Socket;
import java.net.URL;

import static org.openqa.selenium.firefox.FirefoxProfile.PORT_PREFERENCE;
import static org.openqa.selenium.internal.SocketLock.DEFAULT_PORT;

public class NewProfileExtensionConnection implements ExtensionConnection, NeedsLocalLogs {
  private final static int BUFFER_SIZE = 4096;

  private static final NetworkUtils networkUtils = new NetworkUtils();
  private final long connectTimeout;
  private final FirefoxBinary process;
  private final FirefoxProfile profile;
  private final String host;
  private final Lock lock;
  private File profileDir;


  private HttpCommandExecutor delegate;

  private LocalLogs logs = LocalLogs.getNullLogger();

  public NewProfileExtensionConnection(Lock lock, FirefoxBinary binary, FirefoxProfile profile,
      String host) throws Exception {
    this.host = host;
    this.connectTimeout = binary.getTimeout();
    this.lock = lock;
    this.profile = profile;
    this.process = binary;
  }

  public void start() throws IOException {
    int port = 0;

    lock.lock(connectTimeout);
    try {
      port = determineNextFreePort(DEFAULT_PORT);
      profile.setPreference(PORT_PREFERENCE, port);

      profileDir = profile.layoutOnDisk();

      process.clean(profile, profileDir);

      delegate = new HttpCommandExecutor(buildUrl(host, port));
      delegate.setLocalLogs(logs);
      String firefoxLogFile = System.getProperty("webdriver.firefox.logfile");

      if (firefoxLogFile !=  null) {
        if ("/dev/stdout".equals(firefoxLogFile)) {
          process.setOutputWatcher(System.out);
        } else {
          File logFile = new File(firefoxLogFile);
          process.setOutputWatcher(new CircularOutputStream(logFile, BUFFER_SIZE));
        }
      }

      process.startProfile(profile, profileDir, "-foreground");

      // Just for the record; the critical section is all along while firefox is starting with the
      // profile.

      // There is currently no mechanism for the profile to notify us when it has started
      // successfully and is ready for requests. Instead, we must loop until we're able to
      // open a connection with the server, at which point it should be safe to continue
      // (since the extension shouldn't accept connections until it is ready for requests).
      long waitUntil = System.currentTimeMillis() + connectTimeout;
      while (!isConnected()) {
        if (waitUntil < System.currentTimeMillis()) {
          throw new NotConnectedException(
              delegate.getAddressOfRemoteServer(), connectTimeout, process.getConsoleOutput());
        }

        try {
          Thread.sleep(100);
        } catch (InterruptedException ignored) {
          // Do nothing
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
      throw new WebDriverException(
          String.format("Failed to connect to binary %s on port %d; process output follows: \n%s",
              process.toString(), port, process.getConsoleOutput()), e);
    } catch (WebDriverException e) {
      throw new WebDriverException(
          String.format("Failed to connect to binary %s on port %d; process output follows: \n%s",
              process.toString(), port, process.getConsoleOutput()), e);
    } catch (Exception e) {
      throw new WebDriverException(e);
    } finally {
      lock.unlock();
    }
  }

  public Response execute(Command command) throws IOException {
    return delegate.execute(command);
  }

  protected int determineNextFreePort(int port) {
    // Attempt to connect to the given port on the host
    // If we can't connect, then we're good to use it
    int newport;

    for (newport = port; newport < port + 200; newport++) {
      Socket socket = new Socket();
      InetSocketAddress address = new InetSocketAddress(networkUtils.obtainLoopbackIp4Address(),
                                                        newport);

      try {
        socket.bind(address);
        return newport;
      } catch (IOException e) {
        // Port is already bound. Skip it and continue
      } finally {
        try {
          socket.close();
        } catch (IOException ignored) {
          // Nothing sane to do. Ignore this.
        }
      }
    }

    throw new WebDriverException(
        String.format("Cannot find free port in the range %d to %d ", port, newport));
  }

  public void quit() {
    // This should only be called after the QUIT command has been sent,
    // so go ahead and clean up our process and profile.
    process.quit();
    if (profileDir != null) {
      profile.clean(profileDir);
    }
  }

  /**
   * Builds the URL for the Firefox extension running on the given host and port. If the host is
   * {@code localhost}, an attempt will be made to find the correct loopback address.
   * 
   * @param host The hostname the extension is running on.
   * @param port The port the extension is listening on.
   * @return The URL of the Firefox extension.
   */
  private static URL buildUrl(String host, int port) {
    String hostToUse = "localhost".equals(host) ? networkUtils.obtainLoopbackIp4Address() : host;
    try {
      return new URL("http", hostToUse, port, "/hub");
    } catch (MalformedURLException e) {
      throw new WebDriverException(e);
    }
  }

  public boolean isConnected() {
    try {
      // TODO: use a more intelligent way of testing if the server is ready.
      delegate.getAddressOfRemoteServer().openConnection().connect();
      return true;
    } catch (IOException e) {
      // Cannot connect yet.
      return false;
    }
  }

  public void setLocalLogs(LocalLogs logs) {
    if (delegate != null) {
      delegate.setLocalLogs(logs);
    }
    this.logs = logs;
  }
}
