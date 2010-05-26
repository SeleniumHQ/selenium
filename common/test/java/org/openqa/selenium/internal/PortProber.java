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
import java.lang.Math;
import java.net.ConnectException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import static java.util.concurrent.TimeUnit.SECONDS;

public class PortProber {
  private final static Random random = new Random();

  public static int findFreePort() {
    for (int i = 0; i < 5; i++) {
      int seedPort = createAcceptablePort();
      int suggestedPort = checkPortIsFree(seedPort);
      if (suggestedPort != -1) {
        return suggestedPort;
      }
    }
    throw new RuntimeException("Unable to find a free port");
  }

  private static int createAcceptablePort() {
    synchronized (random) {
      int seed = random.nextInt();
      // avoid protected ports
      final int FIRST_PORT = 1025;
      final int LAST_PORT = 65534;
      final int randomInt = Math.abs(random.nextInt());
      seed = (randomInt % (LAST_PORT - FIRST_PORT + 1)) + FIRST_PORT;
      return seed;
    }
  }

  private static int checkPortIsFree(int port) {
    ServerSocket socket = null;
    try {
      socket = new ServerSocket(port);
      int localPort = socket.getLocalPort();
      socket.close();
      return localPort;
    } catch (IOException e) {
      return -1;
    }
  }

  public static boolean pollPort(int port) {
    return pollPort(port, 15, SECONDS);
  }

  public static boolean pollPort(int port, int timeout, TimeUnit unit) {
    long end = System.currentTimeMillis() + unit.toMillis(timeout);
    while (System.currentTimeMillis() < end) {
      try {
        Socket socket = new Socket("localhost", port);
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
