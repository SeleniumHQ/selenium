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

package org.openqa.selenium;

import org.openqa.selenium.internal.BuildInfo;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class WebDriverException extends RuntimeException {

  public static final String SESSION_ID = "Session ID";
  public static final String DRIVER_INFO = "Driver info";
  protected static final String BASE_SUPPORT_URL = "http://seleniumhq.org/exceptions/";

  private final static String HOST_NAME;
  private final static String HOST_ADDRESS;

  private Map<String, String> extraInfo = new HashMap<>();

  static {
    // Ideally, we'd use InetAddress.getLocalHost, but this does a reverse DNS lookup. On Windows
    // and Linux this is apparently pretty fast, so we don't get random hangs. On OS X it's
    // amazingly slow. That's less than ideal. Figure things out and cache. We can't rely on
    // Platform since that depends on this class, but fortunately there's only one place we have to
    // worry about slow lookups.

    String current = System.getProperty("os.name");
    String host = System.getenv("HOSTNAME");  // Most OSs
    if (host == null) {
      host = System.getenv("COMPUTERNAME");  // Windows
    }
    if (host == null && "Mac OS X".equals(current)) {
      try {
        Process process = Runtime.getRuntime().exec("hostname");

        if (!process.waitFor(2, TimeUnit.SECONDS)) {
          process.destroyForcibly();
        }
        if (process.exitValue() == 0) {
          try (InputStreamReader isr = new InputStreamReader(process.getInputStream());
               BufferedReader reader = new BufferedReader(isr)) {
            host = reader.readLine();
          }
        }
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException(e);
      } catch (Exception e) {
        // fall through
      }
    }
    if (host == null) {
      // Give up.
      try {
        host = InetAddress.getLocalHost().getHostName();
      } catch (Exception e) {
        host = "Unknown";  // At least we tried.
      }
    }

    HOST_NAME = host;

    String address = null;
    // Now for the IP address. We're going to do silly shenanigans on OS X only.
    if ("Mac OS X".equals(current)) {
      try {
        NetworkInterface en0 = NetworkInterface.getByName("en0");
        Enumeration<InetAddress> addresses = en0.getInetAddresses();
        while (addresses.hasMoreElements()) {
          InetAddress inetAddress = addresses.nextElement();
          address = inetAddress.getHostAddress();
          break;
        }
      } catch (Exception e) {
        // Fall through and go the slow way.
      }
    }
    if (address == null) {
      // Alright. I give up.
      try {
        address = InetAddress.getLocalHost().getHostAddress();
      } catch (Exception e) {
        address = "Unknown";
      }
    }

    HOST_ADDRESS = address;
  }

  public WebDriverException() {
    super();
  }

  public WebDriverException(String message) {
    super(message);
  }

  public WebDriverException(Throwable cause) {
    super(cause);
  }

  public WebDriverException(String message, Throwable cause) {
    super(message, cause);
  }

  @Override
  public String getMessage() {
    return super.getCause() instanceof WebDriverException
           ? super.getMessage() : createMessage(super.getMessage());
  }

  private String createMessage(String originalMessageString) {
    String supportMessage = getSupportUrl() == null ?
        "" : "For documentation on this error, please visit: " + getSupportUrl() + "\n";

    return (originalMessageString == null ? "" : originalMessageString + "\n")
        + supportMessage
        + getBuildInformation() + "\n"
        + getSystemInformation()
        + getAdditionalInformation();
  }

  public String getSystemInformation() {
    return String.format("System info: host: '%s', ip: '%s', os.name: '%s', os.arch: '%s', os.version: '%s', java.version: '%s'",
        HOST_NAME,
        HOST_ADDRESS,
        System.getProperty("os.name"),
        System.getProperty("os.arch"),
        System.getProperty("os.version"),
        System.getProperty("java.version"));
  }

  public String getSupportUrl() {
    return null;
  }

  public BuildInfo getBuildInformation() {
    return new BuildInfo();
  }

  public static String getDriverName(StackTraceElement[] stackTraceElements) {
    String driverName = "unknown";
    for (StackTraceElement e : stackTraceElements) {
      if (e.getClassName().endsWith("Driver")) {
        String[] bits = e.getClassName().split("\\.");
        driverName = bits[bits.length - 1];
      }
    }

    return driverName;
  }

  public void addInfo(String key, String value) {
    extraInfo.put(key, value);
  }

  public String getAdditionalInformation() {
    if (!extraInfo.containsKey(DRIVER_INFO)) {
      extraInfo.put(DRIVER_INFO, "driver.version: " + getDriverName(getStackTrace()));
    }

    String result = "";
    for (Map.Entry<String, String> entry : extraInfo.entrySet()) {
      if (entry.getValue() != null && entry.getValue().startsWith(entry.getKey())) {
        result += "\n" + entry.getValue();
      } else {
        result += "\n" + entry.getKey() + ": " + entry.getValue();
      }
    }
    return result;
  }
}
