/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

import java.io.File;
import java.io.IOException;
import java.net.BindException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.NetworkInterface;
import java.net.Socket;
import java.net.SocketException;
import java.net.URL;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.ExtensionConnection;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.firefox.NotConnectedException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.internal.CircularOutputStream;

public class NewProfileExtensionConnection implements CommandExecutor, ExtensionConnection {
  private final long connectTimeout;
  private final FirefoxBinary process;
  private final FirefoxProfile profile;
  private final String host;
  private final Lock lock;

  private final int bufferSize = 4096;
  private HttpCommandExecutor delegate;

  public NewProfileExtensionConnection(Lock lock, FirefoxBinary binary, FirefoxProfile profile,
                                       String host) throws Exception {
    this.host = host;
    this.connectTimeout = binary.getTimeout();
    this.lock = lock;
    this.profile = profile;
    this.process = binary;
  }

  public void start() throws IOException {
    lock.lock(connectTimeout);
    try {
      delegate = new HttpCommandExecutor(buildUrl(host, determineNextFreePort(profile.getPort())));
      String firefoxLogFile = System.getProperty("webdriver.firefox.logfile");
      File logFile = firefoxLogFile == null ? null : new File(firefoxLogFile);
      this.process.setOutputWatcher(new CircularOutputStream(logFile, bufferSize));

      profile.setPort(delegate.getAddressOfRemoteServer().getPort());
      profile.updateUserPrefs();

      this.process.clean(profile);
      this.process.startProfile(profile);

      // There is currently no mechanism for the profile to notify us when it has started
      // successfully and is ready for requests.  Instead, we must loop until we're able to
      // open a connection with the server, at which point it should be safe to continue
      // (since the extension shouldn't accept connections until it is ready for requests).
      long waitUntil = System.currentTimeMillis() + connectTimeout;
      while (!isConnected()) {
        if (waitUntil < System.currentTimeMillis()) {
          throw new NotConnectedException(
              delegate.getAddressOfRemoteServer(), connectTimeout);
        }

        try {
          Thread.sleep(100);
        } catch(InterruptedException ignored) {
          // Do nothing
        }
      }
    } catch (IOException e) {
      throw new WebDriverException(
          String.format("Failed to connect to binary %s on port %d; process output follows: \n%s",
              process.toString(), profile.getPort(), process.getConsoleOutput()), e);
    } catch (WebDriverException e) {
      throw new WebDriverException(
          String.format("Failed to connect to binary %s on port %d; process output follows: \n%s",
              process.toString(), profile.getPort(), process.getConsoleOutput()), e);
    } catch (Exception e) {
      throw new WebDriverException(e);
    } finally {
      lock.unlock();
    }
  }

  public Response execute(Command command) throws Exception {
    return delegate.execute(command);
  }

  protected int determineNextFreePort(int port) throws IOException {
    // Attempt to connect to the given port on the host
    // If we can't connect, then we're good to use it
    int newport;

    for (newport = port; newport < port + 200; newport++) {
      Socket socket = new Socket();
      InetSocketAddress address = new InetSocketAddress("localhost", newport);

      try {
        socket.bind(address);
        return newport;
      } catch (BindException e) {
        // Port is already bound. Skip it and continue
      } finally {
        socket.close();
      }
    }

    throw new WebDriverException(
        String.format("Cannot find free port in the range %d to %d ", port, newport));
  }

  public void quit() {
    // This should only be called after the QUIT command has been sent,
    // so go ahead and clean up our process and profile.
    process.quit();
    profile.clean();
  }

  /**
   * Builds the URL for the Firefox extension running on the given host and
   * port. If the host is {@code localhost}, an attempt will be made to find the
   * correct loopback address.
   *
   * @param host The hostname the extension is running on.
   * @param port The port the extension is listening on.
   * @return The URL of the Firefox extension.
   */
  private static URL buildUrl(String host, int port) {
    if ("localhost".equals(host)) {
      for (InetSocketAddress address : obtainLoopbackAddresses(port)) {
        try {
          return new URL("http", address.getHostName(), address.getPort(), "/hub");
        } catch (MalformedURLException ignored) {
          // Do nothing; loop and try next address.
        }
      }
      throw new WebDriverException("Unable to find loopback address for localhost");
    } else {
      try {
        return new URL("http", host, port, "/hub");
      } catch (MalformedURLException e) {
        throw new WebDriverException(e);
      }
    }
  }

  private static Set<InetSocketAddress> obtainLoopbackAddresses(int port) {
    Set<InetSocketAddress> localhosts = new HashSet<InetSocketAddress>();

    try {
      Enumeration<NetworkInterface> allInterfaces = NetworkInterface.getNetworkInterfaces();
      while (allInterfaces.hasMoreElements()) {
        NetworkInterface iface = allInterfaces.nextElement();
        Enumeration<InetAddress> allAddresses = iface.getInetAddresses();
        while (allAddresses.hasMoreElements()) {
          InetAddress addr = allAddresses.nextElement();
          if (addr.isLoopbackAddress()) {
            InetSocketAddress socketAddress = new InetSocketAddress(addr, port);
            localhosts.add(socketAddress);
          }
        }
      }

      // On linux, loopback addresses are named "lo". See if we can find that. We do this
      // craziness because sometimes the loopback device is given an IP range that falls outside
      // of 127/24
      if (Platform.getCurrent()
          .is(Platform.UNIX)) {
        NetworkInterface linuxLoopback = NetworkInterface.getByName("lo");
        if (linuxLoopback != null) {
          Enumeration<InetAddress> possibleLoopbacks = linuxLoopback.getInetAddresses();
          while (possibleLoopbacks.hasMoreElements()) {
            InetAddress inetAddress = possibleLoopbacks.nextElement();
            InetSocketAddress socketAddress = new InetSocketAddress(inetAddress, port);
            localhosts.add(socketAddress);
          }
        }
      }
    } catch (SocketException e) {
      throw new WebDriverException(e);
    }

    if (!localhosts.isEmpty()) {
      return localhosts;
    }

    // Nothing found. Grab the first address we can find
    NetworkInterface firstInterface;
    try {
      firstInterface = NetworkInterface.getNetworkInterfaces().nextElement();
    } catch (SocketException e) {
      throw new WebDriverException(e);
    }
    InetAddress firstAddress = null;
    if (firstInterface != null) {
      firstAddress = firstInterface.getInetAddresses().nextElement();
    }

    if (firstAddress != null) {
      InetSocketAddress socketAddress = new InetSocketAddress(firstAddress, port);
      return Collections.singleton(socketAddress);
    }

    throw new WebDriverException("Unable to find loopback address for localhost");
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
}
