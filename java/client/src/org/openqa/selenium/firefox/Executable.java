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

package org.openqa.selenium.firefox;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Wrapper around Firefox executable.
 */
class Executable {

  private final File binary;
  private String version;
  private FirefoxBinary.Channel channel;

  public Executable(File userSpecifiedBinaryPath) {
    Require.argument("Path to the firefox binary", (Object) userSpecifiedBinaryPath).nonNull();
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
    Path applicationIni = getResource("application.ini");
    if (Files.exists(applicationIni)) {
      try (BufferedReader reader = Files.newBufferedReader(applicationIni)) {
        version = reader.lines()
            .map(String::trim)
            .filter(line -> line.startsWith("Version="))
            .findFirst()
            .map(line -> line.substring("Version=".length()))
            .orElseThrow(() -> new WebDriverException("Cannot get version info for Firefox binary " + binary));
      } catch (IOException e) {
        throw new WebDriverException("Cannot get version info for Firefox binary " + binary, e);
      }
    } else {
      // Set version to something with a ridiculously high number.
      version = "1000.0 unknown";
    }
  }

  private void loadChannelPref() {
    Path channelPrefs = getResource("defaults/pref/channel-prefs.js");

    if (Files.exists(channelPrefs)) {
      try (BufferedReader reader = Files.newBufferedReader(channelPrefs)) {
        channel = reader.lines()
            .map(String::trim)
            .filter(line -> line.startsWith("pref(\"app.update.channel\""))
            .findFirst()
            .map(line -> FirefoxBinary.Channel.fromString(
                line.substring("pref(\"app.update.channel\", \"".length(),
                               line.length() - "\");".length())))
            .orElseThrow(() -> new WebDriverException("Cannot get channel info for Firefox binary " + binary));
      } catch (IOException e) {
        throw new WebDriverException("Cannot get channel info for Firefox binary " + binary, e);
      }
    } else {
      // Pick a sane default
      channel = FirefoxBinary.Channel.RELEASE;
    }
  }

  private Path getResource(String resourceName) {
    Path binaryLocation = binary.getAbsoluteFile().toPath();
    if (Platform.getCurrent().is(Platform.MAC)) {
      return binaryLocation.getParent().getParent().resolve("Resources").resolve(resourceName);
    } else {
      return binaryLocation.getParent().resolve(resourceName);
    }
  }
}
