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

package org.openqa.selenium.remote;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.bidi.webextension.ExtensionBase64Encoded;
import org.openqa.selenium.bidi.webextension.ExtensionData;
import org.openqa.selenium.bidi.webextension.ExtensionPath;
import org.openqa.selenium.bidi.webextension.InstallExtensionParameters;
import org.openqa.selenium.bidi.webextension.UninstallExtensionParameters;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.webextension.FirefoxWebExtensionOptions;
import org.openqa.selenium.webextension.HasWebExtensions;
import org.openqa.selenium.webextension.WebExtension;
import org.openqa.selenium.webextension.WebExtensionOptions;

/**
 * The single {@link HasWebExtensions} implementation shared by every {@link RemoteWebDriver}. It
 * routes each call to WebDriver BiDi when the session negotiated it, to the classic Firefox {@code
 * /moz/addon} endpoint when it did not, or raises when neither can serve the request.
 */
// maybeGetBiDi() is deprecated for external callers, but still the way to check BiDi from within
// the remote package.
@SuppressWarnings("deprecation")
class RemoteWebExtensions implements HasWebExtensions {

  private static final Logger LOG = Logger.getLogger(RemoteWebExtensions.class.getName());

  private final RemoteWebDriver driver;

  RemoteWebExtensions(RemoteWebDriver driver) {
    this.driver = Require.nonNull("Driver", driver);
  }

  @Override
  public WebExtension installWebExtension(Path path) {
    return install(Source.of(path), new WebExtensionOptions());
  }

  @Override
  public WebExtension installWebExtension(Path path, WebExtensionOptions options) {
    return install(Source.of(path), options);
  }

  @Override
  public WebExtension installWebExtension(String base64Encoded) {
    return install(Source.ofBase64(base64Encoded), new WebExtensionOptions());
  }

  @Override
  public WebExtension installWebExtension(String base64Encoded, WebExtensionOptions options) {
    return install(Source.ofBase64(base64Encoded), options);
  }

  @Override
  public void uninstallWebExtension(WebExtension extension) {
    Require.nonNull("Extension", extension);

    if (driver.maybeGetBiDi().isPresent()) {
      LOG.fine("Uninstalling web extension over BiDi");
      bidiModule()
          .uninstall(new UninstallExtensionParameters(Map.of("extension", extension.getId())));
      return;
    }
    if (isFirefox()) {
      LOG.fine("Uninstalling web extension over the classic endpoint");
      executeClassicCommand(DriverCommand.UNINSTALL_EXTENSION, Map.of("id", extension.getId()));
      return;
    }
    throw unsupported();
  }

  private WebExtension install(Source source, WebExtensionOptions options) {
    Require.nonNull("Options", options);
    FirefoxWebExtensionOptions firefoxOptions = firefoxOptions(options);

    if (driver.maybeGetBiDi().isPresent()) {
      LOG.fine("Installing web extension over BiDi");
      return installOverBiDi(source, firefoxOptions);
    }
    if (isFirefox()) {
      LOG.fine("Installing web extension over the classic endpoint");
      return installOverClassic(source, firefoxOptions);
    }
    throw unsupported();
  }

  /**
   * Narrows {@code options} to the Firefox type, or {@code null} when nothing is set. Rejects
   * vendor options on a non-Firefox session, and any unrecognised subtype.
   */
  private @Nullable FirefoxWebExtensionOptions firefoxOptions(WebExtensionOptions options) {
    if (options.isEmpty()) {
      return null;
    }
    if (!isFirefox()) {
      throw new InvalidArgumentException(
          "permanent / allowPrivateBrowsing are Firefox-only web extension options; this session is"
              + " "
              + driver.getCapabilities().getBrowserName());
    }
    if (options instanceof FirefoxWebExtensionOptions) {
      return (FirefoxWebExtensionOptions) options;
    }
    throw new InvalidArgumentException(
        "Unsupported web extension options type: " + options.getClass().getName());
  }

  private WebExtension installOverBiDi(
      Source source, @Nullable FirefoxWebExtensionOptions firefoxOptions) {
    Map<String, Object> vendorOptions = Map.of();
    if (firefoxOptions != null) {
      Map<String, Object> moz = new HashMap<>();
      firefoxOptions.isPermanent().ifPresent(permanent -> moz.put("moz:permanent", permanent));
      firefoxOptions
          .allowsPrivateBrowsing()
          .ifPresent(allow -> moz.put("moz:allowPrivateBrowsing", allow));
      vendorOptions = moz;
    }

    Map<String, Object> result =
        bidiModule().install(new InstallExtensionParameters(extensionData(source), vendorOptions));

    Object id = result.get("extension");
    if (!(id instanceof String)) {
      throw new WebDriverException("webExtension.install returned no extension id: " + result);
    }
    return new WebExtension((String) id);
  }

  private ExtensionData extensionData(Source source) {
    if (!source.isDirectory()) {
      return new ExtensionBase64Encoded(source.toBase64());
    }
    if (isFirefox()) {
      // Firefox's BiDi webExtension.install accepts {type: "path"} for a directory and returns
      // an id parsed from the manifest, but never actually activates the extension. Zipping the
      // directory (like the classic /moz/addon/install endpoint already does) works.
      return new ExtensionBase64Encoded(source.toBase64());
    }
    // Chromium's BiDi implementation is the opposite: it installs only unpacked directories,
    // never archives (SeleniumHQ/selenium#16541), so it needs a real path.
    Path directory = requireNonNullPath(source);
    String resolved =
        browserSharesFilesystem()
            ? directory.toAbsolutePath().toString()
            : uploadDirectory(directory);
    return new ExtensionPath(resolved);
  }

  private WebExtension installOverClassic(
      Source source, @Nullable FirefoxWebExtensionOptions firefoxOptions) {
    Map<String, Object> params = new HashMap<>();
    params.put("addon", source.toBase64());
    if (firefoxOptions != null) {
      firefoxOptions.isPermanent().ifPresent(permanent -> params.put("temporary", !permanent));
      firefoxOptions
          .allowsPrivateBrowsing()
          .ifPresent(allow -> params.put("allowPrivateBrowsing", allow));
    }

    Response response = executeClassicCommand(DriverCommand.INSTALL_EXTENSION, params);
    Object id = response.getValue();
    if (!(id instanceof String)) {
      throw new WebDriverException("installExtension returned no extension id: " + id);
    }
    return new WebExtension((String) id);
  }

  /**
   * Runs a classic Firefox addon command, raising a clear error if it isn't registered — which
   * happens when {@code selenium-firefox-driver} (the artifact that registers {@code /moz/addon/*})
   * isn't on the classpath of a session that otherwise looks like Firefox.
   */
  private Response executeClassicCommand(String command, Map<String, ?> params) {
    try {
      return driver.execute(command, params);
    } catch (UnsupportedCommandException e) {
      throw new WebDriverException(
          "installWebExtension/uninstallWebExtension need the selenium-firefox-driver artifact on"
              + " the classpath to use the classic Firefox endpoint; add it, or enable BiDi"
              + " instead.",
          e);
    }
  }

  private String uploadDirectory(Path directory) {
    try {
      Response response =
          driver.execute(
              DriverCommand.UPLOAD_FILE,
              Map.of("file", Zip.zipToBase64PreservingRoot(directory.toFile())));
      return String.valueOf(response.getValue());
    } catch (IOException e) {
      throw new UncheckedIOException("Unable to upload web extension directory " + directory, e);
    }
  }

  private org.openqa.selenium.bidi.webextension.WebExtension bidiModule() {
    return new org.openqa.selenium.bidi.webextension.WebExtension(driver);
  }

  private boolean isFirefox() {
    return Browser.FIREFOX.is(driver.getCapabilities());
  }

  /** A directory path only resolves on the machine running the browser. */
  private boolean browserSharesFilesystem() {
    return driver.getCommandExecutor() instanceof DriverCommandExecutor;
  }

  private WebDriverException unsupported() {
    return new WebDriverException(
        "installWebExtension requires a WebDriver BiDi session; start the session with the"
            + " webSocketUrl capability set to true (options.enableBiDi()).");
  }

  private static Path requireNonNullPath(Source source) {
    Path path = source.path;
    if (path == null) {
      throw new IllegalStateException("Base64 sources have no path");
    }
    return path;
  }

  /** Where an extension is coming from: a path (directory or packed archive) or Base64 bytes. */
  private static final class Source {

    private final @Nullable Path path;
    private final @Nullable String base64;

    private Source(@Nullable Path path, @Nullable String base64) {
      this.path = path;
      this.base64 = base64;
    }

    static Source of(Path path) {
      Require.nonNull("Path", path);
      if (!Files.exists(path)) {
        throw new InvalidArgumentException("Web extension path does not exist: " + path);
      }
      return new Source(path, null);
    }

    static Source ofBase64(String base64Encoded) {
      Require.nonNull("Base64-encoded extension", base64Encoded);
      try {
        Base64.getDecoder().decode(base64Encoded);
      } catch (IllegalArgumentException e) {
        throw new InvalidArgumentException("Not valid Base64: " + base64Encoded, e);
      }
      return new Source(null, base64Encoded);
    }

    boolean isDirectory() {
      return path != null && Files.isDirectory(path);
    }

    /** Base64 bytes of a packed archive — as consumed by {@code /moz/addon/install}. */
    String toBase64() {
      if (base64 != null) {
        return base64;
      }
      try {
        return Files.isDirectory(path)
            ? Zip.zip(path.toFile())
            : Base64.getEncoder().encodeToString(Files.readAllBytes(path));
      } catch (IOException e) {
        throw new UncheckedIOException("Unable to read web extension " + path, e);
      }
    }
  }
}
