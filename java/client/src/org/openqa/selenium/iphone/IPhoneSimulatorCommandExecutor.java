/*
 Copyright 2007-2010 Selenium committers

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

package org.openqa.selenium.iphone;

import com.google.common.annotations.VisibleForTesting;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.Response;

import java.io.IOException;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * A {@link CommandExecutor} that communicates with an iPhone Simulator running on localhost in a
 * subprocess. Before executing each command, the {@link IPhoneSimulatorCommandExecutor} will verify
 * that the simulator is still running and throw an {@link IPhoneSimulatorNotRunningException} if it
 * is not.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class IPhoneSimulatorCommandExecutor implements CommandExecutor {

  private static final Logger LOG =
      Logger.getLogger(IPhoneSimulatorCommandExecutor.class.getName());

  private final CommandExecutor delegate;
  private final IPhoneSimulatorBinary binary;
  private final URL appUrl;

  public IPhoneSimulatorCommandExecutor(URL url, IPhoneSimulatorBinary binary) throws Exception {
    this.delegate = new HttpCommandExecutor(url);
    this.binary = binary;
    this.appUrl = url;
  }

  @VisibleForTesting
  IPhoneSimulatorBinary getBinary() {
    return binary;
  }

  public void startClient() {
    binary.launch();
    waitForServerToRespond(2500);
  }

  private void waitForServerToRespond(long timeoutInMilliseconds) {
    long start = System.currentTimeMillis();
    boolean responding = false;
    while (!responding && (System.currentTimeMillis() - start < timeoutInMilliseconds)) {
      HttpURLConnection connection = null;
      try {
        connection = (HttpURLConnection) appUrl.openConnection();
        connection.setConnectTimeout(500);
        connection.setRequestMethod("TRACE");
        connection.connect();
        responding = true;
      } catch (ProtocolException e) {
        responding = false;
      } catch (IOException e) {
        responding = false;
      } finally {
        if (connection != null) {
          connection.disconnect();
        }
      }
    }
  }

  public void stopClient() {
    binary.shutdown();
  }

  public Response execute(Command command) throws IOException {
    if (!binary.isRunning()) {
      throw new IPhoneSimulatorNotRunningException();
    }

    try {
      return delegate.execute(command);
    } catch (ConnectException e) {
      LOG.log(Level.WARNING, "Connection refused?", e);
      if (!binary.isRunning()) {
        throw new IPhoneSimulatorNotRunningException("The iPhone Simulator died!", e);
      }
      throw e;
    }
  }

  public static class IPhoneSimulatorNotRunningException extends WebDriverException {
    public IPhoneSimulatorNotRunningException() {
      super("The iPhone Simulator is not currently running!");
    }

    public IPhoneSimulatorNotRunningException(Throwable cause) {
      super("The iPhone Simulator is not currently running!", cause);
    }

    public IPhoneSimulatorNotRunningException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}
