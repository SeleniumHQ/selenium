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

import org.openqa.selenium.net.HostIdentifier;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class WebDriverException extends RuntimeException {

  public static final String SESSION_ID = "Session ID";
  public static final String DRIVER_INFO = "Driver info";
  protected static final String BASE_SUPPORT_URL = "https://selenium.dev/exceptions/";

  private final Map<String, String> extraInfo = new ConcurrentHashMap<>();

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

  /**
   * Returns the detail message string of this exception that includes not only the original
   * message passed to the exception constructor but also driver information, system
   * information and extra information added by {@link #addInfo(String, String)} method.
   *
   * To get the original message use {@link #getRawMessage()}
   *
   * @return the detail message string of this exception.
   */
  @Override
  public String getMessage() {
    return getCause() instanceof WebDriverException
           ? super.getMessage() : createMessage(super.getMessage());
  }

  /**
   * Returns the simple message string of this exception.
   *
   * @return the simple message string of this exception.
   * @see #getMessage()
   */
  public String getRawMessage() {
    return super.getMessage();
  }

  private String createMessage(String originalMessageString) {
    String supportMessage = Optional.ofNullable(getSupportUrl())
      .map(url -> String.format("For documentation on this error, please visit: %s", url))
      .orElse("");

    return Stream.of(
      originalMessageString == null ? "" : originalMessageString,
      supportMessage,
      getBuildInformation().toString(),
      getSystemInformation(),
      getAdditionalInformation()
    ).filter(s -> !(s == null || s.equals(""))).collect(Collectors.joining("\n"));
  }

  public String getSystemInformation() {
    return String.format(
      "System info: host: '%s', ip: '%s', os.name: '%s', os.arch: '%s', os.version: '%s', java.version: '%s'",
      HostIdentifier.getHostName(), HostIdentifier.getHostAddress(),
      System.getProperty("os.name"), System.getProperty("os.arch"),
      System.getProperty("os.version"), System.getProperty("java.version"));
  }

  public String getSupportUrl() {
    return null;
  }

  public BuildInfo getBuildInformation() {
    return new BuildInfo();
  }

  public static String getDriverName(StackTraceElement[] stackTraceElements) {
    return Stream.of(stackTraceElements)
      .filter(e -> e.getClassName().endsWith("Driver"))
      .map(e -> {
        String[] bits = e.getClassName().split("\\.");
        return bits[bits.length - 1];
      })
      .reduce((first, last) -> last)
      .orElse("unknown");
  }

  public void addInfo(String key, String value) {
    extraInfo.put(key, value);
  }

  public String getAdditionalInformation() {
    extraInfo.computeIfAbsent(
      DRIVER_INFO, key -> "driver.version: " + getDriverName(getStackTrace()));

    return extraInfo.entrySet().stream()
      .map(entry -> entry.getValue() != null && entry.getValue().startsWith(entry.getKey())
                    ? entry.getValue()
                    : entry.getKey() + ": " + entry.getValue())
      .collect(Collectors.joining("\n"));
  }
}
