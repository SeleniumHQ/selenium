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

import static java.util.logging.Level.WARNING;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.nio.charset.Charset;
import java.util.Enumeration;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;
import org.openqa.selenium.Platform;

public class HostIdentifier {
  private static final Logger LOG = Logger.getLogger(HostIdentifier.class.getName());

  private static volatile String hostName;
  private static volatile String hostAddress;

  private static String resolveHostName() {
    // Ideally, we'd use InetAddress.getLocalHost, but this does a reverse DNS lookup. On Windows
    // and Linux this is apparently pretty fast, so we don't get random hangs. On OS X it's
    // amazingly slow. That's less than ideal. Figure things out and cache.
    String host = System.getenv("HOSTNAME"); // Most OSs
    if (host == null) {
      host = System.getenv("COMPUTERNAME"); // Windows
    }
    if (host == null && Platform.getCurrent().is(Platform.MAC)) {
      try {
        Process process = Runtime.getRuntime().exec("hostname");

        if (!process.waitFor(2, TimeUnit.SECONDS)) {
          process.destroyForcibly();
          // According to the docs for `destroyForcibly` this is a good idea.
          process.waitFor(2, TimeUnit.SECONDS);
        }
        if (process.exitValue() == 0) {
          try (InputStreamReader isr =
                  new InputStreamReader(process.getInputStream(), Charset.defaultCharset());
              BufferedReader reader = new BufferedReader(isr)) {
            host = reader.readLine();
          }
        }
      } catch (InterruptedException e) {
        LOG.log(WARNING, "Failed to resolve host name", e);
        Thread.currentThread().interrupt();
        throw new RuntimeException(e);
      } catch (Throwable e) {
        // fall through
        LOG.log(WARNING, "Failed to resolve host name", e);
      }
    }
    if (host == null) {
      // Give up.
      try {
        host = InetAddress.getLocalHost().getHostName();
      } catch (Throwable e) {
        host = "Unknown"; // At least we tried.
        LOG.log(WARNING, "Failed to resolve host name", e);
      }
    }

    return host;
  }

  private static String resolveHostAddress() {
    String address = null;
    // Now for the IP address. We're going to do silly shenanigans on OS X only.
    if (Platform.getCurrent().is(Platform.MAC)) {
      try {
        NetworkInterface en0 = NetworkInterface.getByName("en0");
        if (en0 != null) {
          Enumeration<InetAddress> addresses = en0.getInetAddresses();
          if (addresses.hasMoreElements()) {
            address = addresses.nextElement().getHostAddress();
          }
        }
      } catch (Throwable e) {
        // Fall through and go the slow way.
        LOG.log(WARNING, "Failed to resolve host address", e);
      }
    }
    if (address == null) {
      // Alright. I give up.
      try {
        address = InetAddress.getLocalHost().getHostAddress();
      } catch (Throwable e) {
        address = "Unknown";
        LOG.log(WARNING, "Failed to resolve host address", e);
      }
    }

    return address;
  }

  public static synchronized String getHostName() {
    if (hostName == null) {
      hostName = resolveHostName();
    }
    return hostName;
  }

  public static synchronized String getHostAddress() {
    if (hostAddress == null) {
      hostAddress = resolveHostAddress();
    }
    return hostAddress;
  }
}
