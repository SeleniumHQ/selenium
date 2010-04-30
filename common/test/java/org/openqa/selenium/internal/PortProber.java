/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.internal;

import java.io.IOException;
import java.net.ConnectException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.TimeUnit;

import static java.util.concurrent.TimeUnit.SECONDS;

public class PortProber {
  public static int findFreePort() {
    ServerSocket socket = null;
    try {
      socket = new ServerSocket(0);
      return socket.getLocalPort();
    } catch (IOException e) {
      throw new RuntimeException(e);
    } finally {
      if (socket != null) {
        try {
          socket.close();
        } catch (IOException e) {
          // Throw this away
        }
      }
    }
  }

  public static boolean pollPort(int port) {
    return pollPort(port, 15, SECONDS);
  }

  public static boolean pollPort(int port, int timeout, TimeUnit unit) {
    long end = System.currentTimeMillis() + unit.toMillis(timeout);
    while (System.currentTimeMillis() < end) {
      try {
        InetSocketAddress address = new InetSocketAddress(InetAddress.getByName(null), port);

        Socket socket = new Socket();
        socket.connect(address, 15000);
        socket.close();
        return true;
      } catch (ConnectException e) {
        // Ignore this
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }

    return false;
  }
}
