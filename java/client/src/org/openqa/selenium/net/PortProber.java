/*
Copyright 2013 Software Freedom Conservancy
Copyright 2010-2013 Selenium committers

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

package org.openqa.selenium.net;

import org.openqa.selenium.Platform;

import java.io.IOException;
import java.net.ConnectException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.Random;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import static java.util.concurrent.TimeUnit.SECONDS;

@SuppressWarnings({"UtilityClass"})
public class PortProber {

  public static final int FIND_FREE_PORT_RETRIES = 5;

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

  /**
   * Find a free port that is within a probable free range.
   *
   * @return a free port number
   * @throws RuntimeException if unable to find a free port
   */
  public static int findFreePort() {
    return findFreePort(getNonEphemeralRange());
  }

  /**
   * Find a free port that is within the given port range.
   *
   * @param range the range of ports (inclusively) to search for free ports on
   * @return a free port number
   * @throws RuntimeException if unable to find a free port
   */
  public static int findFreePort(PortRange range) {
    for (int i = 0; i < FIND_FREE_PORT_RETRIES; i++) {
      int seedPort = getRandomPortFromRange(range);
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
   * Returns a port that is within a probable free range.
   *
   * <p /> Based on the ports in http://en.wikipedia.org/wiki/Ephemeral_ports, this method stays
   * away from all well-known ephemeral port ranges, since they can arbitrarily race with the
   * operating system in allocations.  Due to the port-greedy nature of selenium this happens fairly
   * frequently. Staying within the known safe range increases the probability tests will run green
   * quite significantly.
   *
   * @return a random port number
   */
  private static PortRange getNonEphemeralRange() {
    final int firstPort;
    final int lastPort;

    int freeAbove = 65535 - ephemeralRangeDetector.getHighestEphemeralPort();
    int freeBelow = Math.max(0, ephemeralRangeDetector.getLowestEphemeralPort() - 1024);

    if (freeAbove > freeBelow) {
      firstPort = ephemeralRangeDetector.getHighestEphemeralPort();
      lastPort = 65535;
    } else {
      firstPort = 1024;
      lastPort = ephemeralRangeDetector.getLowestEphemeralPort();
    }

    if (firstPort == lastPort) {
      return new PortRange(firstPort, firstPort);
    }
    if (firstPort > lastPort) {
      throw new UnsupportedOperationException("Could not find ephemeral port to use");
    }
    return new PortRange(firstPort, lastPort);
  }

  private static int getRandomPortFromRange(PortRange range) {
    synchronized (random) {
      final int randomInt = random.nextInt();
      final int offset = Math.abs(randomInt % (range.getEnd() - range.getStart() + 1));
      return randomInt + offset;
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
        // ignore this
      } catch (UnknownHostException e) {
        throw new RuntimeException(e);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }

    return false;
  }

  /**
   * Represents a port range, where the last port is inclusive.
   */
  public static class PortRange {
    private int start;
    private int end;

    public int getStart() {
      return start;
    }

    public int getEnd() {
      return end;
    }

    public PortRange(int start, int end) {
      this.start = start;
      this.end = end;
    }
  }

}