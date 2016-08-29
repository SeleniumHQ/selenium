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

package org.openqa.selenium.net;

import org.openqa.selenium.Platform;

import java.io.IOException;
import java.net.ConnectException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.UnknownHostException;
import java.net.SocketTimeoutException;
import java.util.Random;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import static java.lang.Math.max;
import static java.util.concurrent.TimeUnit.SECONDS;

public class PortProber {

  private static final Random random = new Random();
  private static final EphemeralPortRangeDetector ephemeralRangeDetector;

  static {
    final Platform current = Platform.getCurrent();

    if (current.is(Platform.LINUX)) {
       ephemeralRangeDetector = LinuxEphemeralPortRangeDetector.getInstance();
     } else if (current.is(Platform.XP)) {
       ephemeralRangeDetector = new OlderWindowsVersionEphemeralPortDetector();
    } else {
       ephemeralRangeDetector = new FixedIANAPortRange();
    }
  }

  public static final int HIGHEST_PORT = 65535;
  public static final int START_OF_USER_PORTS = 1024;

  private PortProber() {
    // Utility class
  }

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

  public static Callable<Integer> freeLocalPort(final int port) {
    return new Callable<Integer>() {

      public Integer call()
          throws Exception {
        if (checkPortIsFree(port) != -1) {
          return port;
        }
        return null;
      }
    };
  }

  /**
   * Returns a port that is within a probable free range. <p/> Based on the ports in
   * http://en.wikipedia.org/wiki/Ephemeral_ports, this method stays away from all well-known
   * ephemeral port ranges, since they can arbitrarily race with the operating system in
   * allocations. Due to the port-greedy nature of selenium this happens fairly frequently.
   * Staying within the known safe range increases the probability tests will run green quite
   * significantly.
   *
   * @return a random port number
   */
  private static int createAcceptablePort() {
    synchronized (random) {
      final int FIRST_PORT;
      final int LAST_PORT;

      int freeAbove = HIGHEST_PORT - ephemeralRangeDetector.getHighestEphemeralPort();
      int freeBelow = max(0, ephemeralRangeDetector.getLowestEphemeralPort() - START_OF_USER_PORTS);

      if (freeAbove > freeBelow) {
        FIRST_PORT = ephemeralRangeDetector.getHighestEphemeralPort();
        LAST_PORT = 65535;
      } else {
        FIRST_PORT = 1024;
        LAST_PORT = ephemeralRangeDetector.getLowestEphemeralPort();
      }

      if (FIRST_PORT == LAST_PORT) {
        return FIRST_PORT;
      }
      if (FIRST_PORT > LAST_PORT) {
        throw new UnsupportedOperationException("Could not find ephemeral port to use");
      }
      final int randomInt = random.nextInt();
      final int portWithoutOffset = Math.abs(randomInt % (LAST_PORT - FIRST_PORT + 1));
      return portWithoutOffset + FIRST_PORT;
    }
  }

  private static int checkPortIsFree(int port) {
    ServerSocket socket;
    try {
      socket = new ServerSocket();
      socket.setReuseAddress(true);
      socket.bind(new InetSocketAddress("localhost", port));
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
        Socket socket = new Socket();
        socket.setReuseAddress(true);
        socket.bind(new InetSocketAddress("localhost", port));
        socket.close();
        return true;
      } catch (ConnectException e) {
        // Ignore this
      } catch (UnknownHostException e) {
        throw new RuntimeException(e);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }

    return false;
  }

  public static void waitForPortUp(int port, int timeout, TimeUnit unit) {
    long end = System.currentTimeMillis() + unit.toMillis(timeout);
    while (System.currentTimeMillis() < end) {
      try {
        Socket socket = new Socket();
        socket.connect(new InetSocketAddress("localhost", port), 1000);
        socket.close();
        return;
      } catch (ConnectException e) {
        // Ignore this
      } catch (SocketTimeoutException e) {
        // Ignore this
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }
  }
}
