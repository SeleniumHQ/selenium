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

package org.openqa.selenium.firefox.xpi;

import static java.util.Collections.singletonList;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.firefox.FirefoxOptions.FIREFOX_OPTIONS;
import static org.openqa.selenium.firefox.FirefoxProfile.PORT_PREFERENCE;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.io.ByteStreams;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.ClasspathExtension;
import org.openqa.selenium.firefox.Extension;
import org.openqa.selenium.firefox.FileExtension;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxDriverService;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;
import java.util.stream.Stream;

/**
 * @deprecated This class will not be replaced.
 */
@Deprecated
public class XpiDriverService extends FirefoxDriverService {

  private static final String NO_FOCUS_LIBRARY_NAME = "x_ignore_nofocus.so";
  private static final String PATH_PREFIX =
      "/" + XpiDriverService.class.getPackage().getName().replace(".", "/") + "/";

  private final Lock lock = new ReentrantLock();

  private final int port;
  private final FirefoxBinary binary;
  private final FirefoxProfile profile;
  private File profileDir;

  private XpiDriverService(
      File executable,
      int port,
      Duration timeout,
      List<String> args,
      Map<String, String> environment,
      FirefoxBinary binary,
      FirefoxProfile profile,
      File logFile)
      throws IOException {
    super(executable, port, timeout, args, environment);

    this.port = Require.positive("Port", port);
    this.binary = binary;
    this.profile = profile;

    String firefoxLogFile = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE);
    if (firefoxLogFile != null) { // System property has higher precedence
      switch (firefoxLogFile) {
        case "/dev/stdout":
          sendOutputTo(System.out);
          break;
        case "/dev/stderr":
          sendOutputTo(System.err);
          break;
        case "/dev/null":
          sendOutputTo(ByteStreams.nullOutputStream());
          break;
        default:
          sendOutputTo(new FileOutputStream(firefoxLogFile));
          break;
      }
    } else {
      if (logFile != null) {
        // TODO: This stream is leaked.
        sendOutputTo(new FileOutputStream(logFile));
      } else {
        sendOutputTo(ByteStreams.nullOutputStream());
      }
    }
  }

  @Override
  protected URL getUrl(int port) throws MalformedURLException {
    return new URL("http", "localhost", port, "/hub");
  }

  @Override
  public void start() throws IOException {
    lock.lock();
    try {
      profile.setPreference(PORT_PREFERENCE, port);
      addWebDriverExtension(profile);
      profile.checkForChangesInFrozenPreferences();
      profileDir = profile.layoutOnDisk();

      ImmutableMap.Builder<String, String> envBuilder = new ImmutableMap.Builder<String, String>()
          .putAll(getEnvironment())
          .put("XRE_PROFILE_PATH", profileDir.getAbsolutePath())
          .put("MOZ_NO_REMOTE", "1")
          .put("MOZ_CRASHREPORTER_DISABLE", "1") // Disable Breakpad
          .put("NO_EM_RESTART", "1"); // Prevent the binary from detaching from the console

      if (Platform.getCurrent().is(Platform.LINUX) && profile.shouldLoadNoFocusLib()) {
        modifyLinkLibraryPath(envBuilder, profileDir);
      }
      Map<String, String> env = envBuilder.build();

      List<String> cmdArray = new ArrayList<>(getArgs());
      cmdArray.addAll(binary.getExtraOptions());
      cmdArray.add("-foreground");
      process = new CommandLine(binary.getPath(), Iterables.toArray(cmdArray, String.class));
      process.setEnvironmentVariables(env);
      process.updateDynamicLibraryPath(env.get(CommandLine.getLibraryPathPropertyName()));
      // On Snow Leopard, beware of problems the sqlite library
      if (! (Platform.getCurrent().is(Platform.MAC) && Platform.getCurrent().getMinorVersion() > 5)) {
        String firefoxLibraryPath = System.getProperty(
            FirefoxDriver.SystemProperty.BROWSER_LIBRARY_PATH,
            binary.getFile().getAbsoluteFile().getParentFile().getAbsolutePath());
        process.updateDynamicLibraryPath(firefoxLibraryPath);
      }

      process.copyOutputTo(getOutputStream());

      process.executeAsync();

      waitUntilAvailable();
    } finally {
      lock.unlock();
    }
  }

  private void modifyLinkLibraryPath(ImmutableMap.Builder<String, String> envBuilder, File profileDir) {
    // Extract x_ignore_nofocus.so from x86, amd64 directories inside
    // the jar into a real place in the filesystem and change LD_LIBRARY_PATH
    // to reflect that.

    String existingLdLibPath = System.getenv("LD_LIBRARY_PATH");
    // The returned new ld lib path is terminated with ':'
    String newLdLibPath =
        extractAndCheck(profileDir, NO_FOCUS_LIBRARY_NAME, PATH_PREFIX + "x86", PATH_PREFIX +
                                                                                "amd64");
    if (existingLdLibPath != null && !existingLdLibPath.equals("")) {
      newLdLibPath += existingLdLibPath;
    }

    envBuilder.put("LD_LIBRARY_PATH", newLdLibPath);
    // Set LD_PRELOAD to x_ignore_nofocus.so - this will be taken automagically
    // from the LD_LIBRARY_PATH
    envBuilder.put("LD_PRELOAD", NO_FOCUS_LIBRARY_NAME);
  }

  private String extractAndCheck(File profileDir, String noFocusSoName,
                                   String jarPath32Bit, String jarPath64Bit) {

    // 1. Extract x86/x_ignore_nofocus.so to profile.getLibsDir32bit
    // 2. Extract amd64/x_ignore_nofocus.so to profile.getLibsDir64bit
    // 3. Create a new LD_LIB_PATH string to contain:
    // profile.getLibsDir32bit + ":" + profile.getLibsDir64bit

    Set<String> pathsSet = new HashSet<>();
    pathsSet.add(jarPath32Bit);
    pathsSet.add(jarPath64Bit);

    StringBuilder builtPath = new StringBuilder();

    for (String path : pathsSet) {
      try {

        FileHandler.copyResource(profileDir, getClass(), path + File.separator + noFocusSoName);

      } catch (IOException e) {
        if (Boolean.getBoolean("webdriver.development")) {
          System.err.println(
              "Exception unpacking required library, but in development mode. Continuing");
        } else {
          throw new WebDriverException(e);
        }
      } // End catch.

      String outSoPath = profileDir.getAbsolutePath() + File.separator + path;

      File file = new File(outSoPath, noFocusSoName);
      if (!file.exists()) {
        throw new WebDriverException("Could not locate " + path + ": "
                                     + "native events will not work.");
      }

      builtPath.append(outSoPath).append(":");
    }

    return builtPath.toString();
  }

  @Override
  protected void waitUntilAvailable() {
    try {
      // Use a longer timeout, because 45 seconds was the default timeout in the predecessor to
      // XpiDriverService. This has to wait for Firefox to start, not just a service, and some users
      // may be running tests on really slow machines.
      URL status = new URL(getUrl(port).toString() + "/status");
      new UrlChecker().waitUntilAvailable(45, SECONDS, status);
    } catch (MalformedURLException e) {
      throw new WebDriverException("Driver server status URL is malformed.", e);
    } catch (UrlChecker.TimeoutException e) {
      throw new WebDriverException("Timed out waiting 45 seconds for Firefox to start.", e);
    }
  }

  @Override
  public void stop() {
    super.stop();
    profile.cleanTemporaryModel();
    profile.clean(profileDir);
  }

  private void addWebDriverExtension(FirefoxProfile profile) {
    if (profile.containsWebDriverExtension()) {
      return;
    }
    profile.addExtension("webdriver", loadCustomExtension().orElse(loadDefaultExtension()));
  }

  private Optional<Extension> loadCustomExtension() {
    String xpiProperty = System.getProperty(FirefoxDriver.SystemProperty.DRIVER_XPI_PROPERTY);
    if (xpiProperty != null) {
      File xpi = new File(xpiProperty);
      return Optional.of(new FileExtension(xpi));
    }
    return Optional.empty();
  }

  private static Extension loadDefaultExtension() {
    return new ClasspathExtension(
        FirefoxProfile.class,
        "/" + XpiDriverService.class.getPackage().getName().replace(".", "/") + "/webdriver.xpi");
  }

  /**
   * Configures and returns a new {@link XpiDriverService} using the default configuration. In
   * this configuration, the service will use the firefox executable identified by the
   * {@link FirefoxDriver.SystemProperty#BROWSER_BINARY} system property on a free port.
   *
   * @return A new XpiDriverService using the default configuration.
   */
  public static XpiDriverService createDefaultService() {
    try {
      return new Builder().build();
    } catch (WebDriverException e) {
      throw new IllegalStateException(e.getMessage(), e.getCause());
    }
  }

  @SuppressWarnings("unchecked")
  static XpiDriverService createDefaultService(Capabilities caps) {
    Builder builder = new Builder().usingAnyFreePort();

    Stream.<Supplier<FirefoxProfile>>of(
        () -> (FirefoxProfile) caps.getCapability(FirefoxDriver.Capability.PROFILE),
        () -> { try {
          return FirefoxProfile.fromJson((String) caps.getCapability(FirefoxDriver.Capability.PROFILE));
        } catch (IOException ex) {
          throw new RuntimeException(ex);
        }},
        // Don't believe IDEA, this lambda can't be replaced with a method reference!
        () -> ((FirefoxOptions) caps).getProfile(),
        () -> (FirefoxProfile) ((Map<String, Object>) caps.getCapability(FIREFOX_OPTIONS)).get("profile"),
        () -> { try {
          return FirefoxProfile.fromJson(
              (String) ((Map<String, Object>) caps.getCapability(FIREFOX_OPTIONS)).get("profile"));
        } catch (IOException ex) {
          throw new RuntimeException(ex);
        }},
        () -> {
          Map<String, Object> options = (Map<String, Object>) caps.getCapability(FIREFOX_OPTIONS);
          FirefoxProfile toReturn = new FirefoxProfile();
          ((Map<String, Object>) options.get("prefs")).forEach((key, value) -> {
            if (value instanceof Boolean) { toReturn.setPreference(key, (Boolean) value); }
            if (value instanceof Integer) { toReturn.setPreference(key, (Integer) value); }
            if (value instanceof String) { toReturn.setPreference(key, (String) value); }
          });
          return toReturn;
        })
        .map(supplier -> {
          try {
            return supplier.get();
          } catch (Exception e) {
            return null;
          }
        })
        .filter(Objects::nonNull)
        .findFirst()
        .ifPresent(builder::withProfile);

    Object binary = caps.getCapability(FirefoxDriver.Capability.BINARY);
    if (binary != null) {
      FirefoxBinary actualBinary;
      if (binary instanceof FirefoxBinary) {
        actualBinary = (FirefoxBinary) binary;
      } else if (binary instanceof String) {
        actualBinary = new FirefoxBinary(new File(String.valueOf(binary)));
      } else {
        throw new IllegalArgumentException(
            "Expected binary to be a string or a binary: " + binary);
      }

      builder.withBinary(actualBinary);
    }

    return builder.build();

  }

  public static Builder builder() {
    return new Builder();
  }

  @AutoService(DriverService.Builder.class)
  public static class Builder extends FirefoxDriverService.Builder<XpiDriverService, XpiDriverService.Builder> {

    private FirefoxBinary binary = null;
    private FirefoxProfile profile = null;

    @Override
    protected boolean isLegacy() {
      return true;
    }

    @Override
    public int score(Capabilities capabilities) {
      if (capabilities.is(FirefoxDriver.Capability.MARIONETTE)) {
        return 0;
      }

      int score = 0;

      if (capabilities.getCapability(FirefoxDriver.Capability.BINARY) != null) {
        score++;
      }

      if (capabilities.getCapability(FirefoxDriver.Capability.PROFILE) != null) {
        score++;
      }

      return score;
    }

    public Builder withBinary(FirefoxBinary binary) {
      this.binary = Require.nonNull("Firefox binary", binary);
      return this;
    }

    public Builder withProfile(FirefoxProfile profile) {
      this.profile = Require.nonNull("Firefox profile", profile);
      return this;
    }

    @Override
    protected FirefoxDriverService.Builder withOptions(FirefoxOptions options) {
      FirefoxProfile profile = options.getProfile();
      if (profile == null) {
        profile = new FirefoxProfile();
        options.setCapability(FirefoxDriver.Capability.PROFILE, profile);
      }
      withBinary(options.getBinary());
      withProfile(profile);
      return this;
    }

    @Override
    protected File findDefaultExecutable() {
      if (binary == null) {
        return new FirefoxBinary().getFile();
      }
      return binary.getFile();
    }

    @Override
    protected List<String> createArgs() {
      return singletonList("-foreground");
    }

    @Override
    protected Duration getDefaultTimeout() {
      return Duration.ofSeconds(45);
    }

    @Override
    protected XpiDriverService createDriverService(
        File exe,
        int port,
        Duration timeout,
        List<String> args,
        Map<String, String> environment) {
      try {
        return new XpiDriverService(
            exe,
            port,
            timeout,
            args,
            environment,
            binary == null ? new FirefoxBinary() : binary,
            profile == null ? new FirefoxProfile() : profile,
            getLogFile());
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
