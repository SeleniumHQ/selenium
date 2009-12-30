/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
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

import java.io.IOException;
import java.net.BindException;
import java.net.InetSocketAddress;
import java.net.Socket;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.Command;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxLauncher;
import org.openqa.selenium.firefox.FirefoxProfile;

public class NewProfileExtensionConnection extends AbstractExtensionConnection {
  private FirefoxBinary process;
  private FirefoxProfile profile;
  private int bufferSize = 4096;

  public NewProfileExtensionConnection(Lock lock, FirefoxBinary binary, FirefoxProfile profile, String host)
      throws IOException {
    lock.lock(binary.getTimeout());
    try {
      int portToUse = determineNextFreePort(host, profile.getPort());

      binary.setOutputWatcher(new CircularOutputStream(bufferSize));
      process = new FirefoxLauncher(binary).startProfile(profile, portToUse);
      this.profile = process.getProfile();

      setAddress(host, portToUse);

      connectToBrowser(binary.getTimeout());
    } finally {
      lock.unlock();
    }
  }

  @Override
  protected void connectToBrowser(long timeToWaitInMilliSeconds) throws IOException {
    try {
      super.connectToBrowser(timeToWaitInMilliSeconds);
    } catch (IOException e) {
      throw new WebDriverException(
          String.format("Failed to connect to binary %s on port %d; process output follows: \n%s",
              process.toString(), profile.getPort(), process.getConsoleOutput()), e);
    } catch (WebDriverException e) {
      throw new WebDriverException(
          String.format("Failed to connect to binary %s on port %d; process output follows: \n%s",
              process.toString(), profile.getPort(), process.getConsoleOutput()), e);
    }
  }

  protected int determineNextFreePort(String host, int port) throws IOException {
    // Attempt to connect to the given port on the host
    // If we can't connect, then we're good to use it
    int newport;

    for (newport = port; newport < port + 200; newport++) {
      Socket socket = new Socket();
      InetSocketAddress address = new InetSocketAddress(host, newport);

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
    try {
      sendMessage(new Command(null, "quit"));
    } catch (Exception e) {
      // this is expected
    }

    process.quit();

    profile.clean();
  }
}
