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


import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.firefox.FirefoxOptions.FIREFOX_OPTIONS;
import static org.openqa.selenium.firefox.FirefoxProfile.PORT_PREFERENCE;

import com.google.auto.service.AutoService;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.ByteStreams;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.ClasspathExtension;
import org.openqa.selenium.firefox.internal.Extension;
import org.openqa.selenium.firefox.internal.FileExtension;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;
import java.util.stream.Stream;

public class XpiDriverService extends DriverService {

  private final Lock lock = new ReentrantLock();

  private final int port;
  private final FirefoxBinary binary;
  private final FirefoxProfile profile;
  private File profileDir;

  private XpiDriverService(
      File executable,
      int port,
      ImmutableList<String> args,
      ImmutableMap<String, String> environment,
      FirefoxBinary binary,
      FirefoxProfile profile,
      File logFile)
      throws IOException {
    super(executable, port, args, environment);

    Preconditions.checkState(port > 0, "Port must be set");

    this.port = port;
    this.binary = binary;
    this.profile = profile;

    String firefoxLogFile = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE);
    if (firefoxLogFile != null) { // System property has higher precedence
      if ("/dev/stdout".equals(firefoxLogFile)) {
        sendOutputTo(System.out);
      } else if ("/dev/stderr".equals(firefoxLogFile)) {
        sendOutputTo(System.err);
      } else if ("/dev/null".equals(firefoxLogFile)) {
        sendOutputTo(ByteStreams.nullOutputStream());
      } else {
        // TODO: This stream is leaked.
        sendOutputTo(new FileOutputStream(firefoxLogFile));
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
      profileDir = profile.layoutOnDisk();

      binary.setOutputWatcher(getOutputStream());

      binary.startProfile(profile, profileDir, "-foreground");

      waitUntilAvailable();
    } finally {
      lock.unlock();
    }
  }

  @Override
  protected void waitUntilAvailable() throws MalformedURLException {
    try {
      // Use a longer timeout, because 45 seconds was the default timeout in the predecessor to
      // XpiDriverService. This has to wait for Firefox to start, not just a service, and some users
      // may be running tests on really slow machines.
      URL status = new URL(getUrl(port).toString() + "/status");
      new UrlChecker().waitUntilAvailable(45, SECONDS, status);
    } catch (UrlChecker.TimeoutException e) {
      throw new WebDriverException("Timed out waiting 45 seconds for Firefox to start.", e);
    }
  }

  @Override
  public void stop() {
    lock.lock();
    try {
      binary.quit();
      profile.cleanTemporaryModel();
      profile.clean(profileDir);
    } finally {
      lock.unlock();
    }
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
        "/" + FirefoxProfile.class.getPackage().getName().replace(".", "/") + "/webdriver.xpi");
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

    FirefoxProfile profile = Stream.<ThrowingSupplier<FirefoxProfile>>of(
        () -> (FirefoxProfile) caps.getCapability(FirefoxDriver.PROFILE),
        () -> FirefoxProfile.fromJson((String) caps.getCapability(FirefoxDriver.PROFILE)),
        () -> ((FirefoxOptions) caps).getProfile(),
        () -> (FirefoxProfile) ((Map<String, Object>) caps.getCapability(FIREFOX_OPTIONS)).get("profile"),
        () -> FirefoxProfile.fromJson((String) ((Map<String, Object>) caps.getCapability(FIREFOX_OPTIONS)).get("profile")),
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
        .orElse(null);

    if (profile != null) {
      builder.withProfile(profile);
    }

    Object binary = caps.getCapability(FirefoxDriver.BINARY);
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
  public static class Builder extends DriverService.Builder<XpiDriverService, XpiDriverService.Builder> {

    private FirefoxBinary binary = null;
    private FirefoxProfile profile = null;

    @Override
    public int score(Capabilities capabilites) {
      if (!capabilites.is(FirefoxDriver.MARIONETTE)) {
        return 0;
      }

      int score = 1;

      if (capabilites.getCapability(FirefoxDriver.BINARY) != null) {
        score++;
      }

      if (capabilites.getCapability(FirefoxDriver.PROFILE) != null) {
        score++;
      }

      return score;
    }

    public Builder withBinary(FirefoxBinary binary) {
      this.binary = Preconditions.checkNotNull(binary);
      return this;
    }

    public Builder withProfile(FirefoxProfile profile) {
      this.profile = Preconditions.checkNotNull(profile);
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
    protected ImmutableList<String> createArgs() {
      return ImmutableList.of("-foreground");
    }

    @Override
    protected XpiDriverService createDriverService(
        File exe,
        int port,
        ImmutableList<String> args,
        ImmutableMap<String, String> environment) {
      try {
        return new XpiDriverService(
            exe,
            port,
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

  @FunctionalInterface
  private interface ThrowingSupplier<V> extends Supplier<V> {

    V throwingGet() throws Exception;

    @Override
    default V get() {
      try {
        return throwingGet();
      } catch (Exception e) {
        if (e instanceof RuntimeException) {
          throw (RuntimeException) e;
        } else {
          throw new RuntimeException(e);
        }
      }
    }
  }
}
