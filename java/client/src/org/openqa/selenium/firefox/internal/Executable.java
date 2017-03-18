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


package org.openqa.selenium.firefox.internal;

import com.google.common.base.Preconditions;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.FirefoxBinary;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

/**
 * Wrapper around Firefox executable.
 */
public class Executable {

  private final File binary;
  private String version;
  private FirefoxBinary.Channel channel;

  public Executable(File userSpecifiedBinaryPath) {
    Preconditions.checkState(userSpecifiedBinaryPath != null,
                             "Path to the firefox binary should not be null");
    Preconditions.checkState(userSpecifiedBinaryPath.exists() && userSpecifiedBinaryPath.isFile(),
                             "Specified firefox binary location does not exist or is not a real file: " +
                             userSpecifiedBinaryPath);
    binary = userSpecifiedBinaryPath;
  }

  public File getDirectory() {
    return binary.getAbsoluteFile().getParentFile();
  }

  public File getFile() {
    return binary;
  }

  public String getPath() {
    return binary.getAbsolutePath();
  }

  public String getVersion() {
    if (version == null) {
      loadApplicationIni();
    }
    return version;
  }

  public FirefoxBinary.Channel getChannel() {
    if (channel == null) {
      loadChannelPref();
    }
    return channel;
  }

  private void loadApplicationIni() {
    Optional<Path> applicationIni = getResource("application.ini");
    if (applicationIni.isPresent()) {
      try (BufferedReader reader = Files.newBufferedReader(applicationIni.get())) {
        reader.lines().map(String::trim).forEach(line -> {
          if (line.startsWith("Version=")) {
            version = line.substring("Version=".length());
          }
        });
      } catch (IOException e) {
        throw new WebDriverException("Cannot get version info for of Firefox binary " + binary, e);
      }
      return;
    }

    // Set version to something with a ridiculously high number.
    version = "1000.0 unknown";
  }

  private void loadChannelPref() {
    Optional<Path> channelPrefs = getResource("defaults/pref/channel-prefs.js");

    if (channelPrefs.isPresent()) {
      try (BufferedReader reader = Files.newBufferedReader(channelPrefs.get())) {
        reader.lines().map(String::trim).forEach(line -> {
          if (line.startsWith("pref(")) {
            channel = FirefoxBinary.Channel.fromString(
                line.substring("pref(\"app.update.channel\", \"".length(),
                               line.length() - "\");".length()));
          }
        });
      } catch (IOException e) {
        throw new WebDriverException("Cannot get channel info for Firefox binary " + binary, e);
      }
      return;
    }

    // Pick a sane default
    channel = FirefoxBinary.Channel.RELEASE;
  }

  private Optional<Path> getResource(String resourceName) {
    Path binaryLocation = binary.getAbsoluteFile().toPath();
    Path discovered;
    if (Platform.getCurrent().is(Platform.MAC)) {
      discovered = binaryLocation.getParent().getParent().resolve("Resources").resolve(resourceName);
    } else {
      discovered = binaryLocation.getParent().resolve(resourceName);
    }

    if (Files.exists(discovered)) {
      return Optional.of(discovered);
    }
    return Optional.empty();
  }
}
