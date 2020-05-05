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

package org.openqa.selenium.testing.drivers;

import static java.util.concurrent.TimeUnit.SECONDS;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.logging.Logger;

/**
 * Supports providing WebDriver instances from an external source using the following system
 * properties:
 * <dl>
 *   <dt>selenium.external.serverUrl</dt>
 *   <dd>Defines the fully qualified URL of an external WebDriver server to send commands to.
 *       This server <i>must</i> be compliant with the
 *       <a href="https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol">JSON wire protocol</a>.
 *       If only this property is provided, then this supplier will provide a new
 *       {@link RemoteWebDriver} instance pointed at the designated server. Otherwise, if a
 *       custom supplier is also defined (see below), this supplier will wait for the server to
 *       be accepting commands before delegating to the designated class for the actual client
 *       creation.
 *   </dd>
 *   <dt>selenium.external.supplierClass</dt>
 *   <dd>Specifies the fully qualified name of another class on the classpath. This class must
 *       implement {@code Supplier<WebDriver>} and have a public constructor that accepts two
 *       {@link Capabilities} objects as arguments (for the desired and required capabilities,
 *       respectively).
 *   </dd>
 * </dl>
 */
class ExternalDriverSupplier implements Supplier<WebDriver> {
  private static final Logger logger = Logger.getLogger(ExternalDriverSupplier.class.getName());

  private static final String DELEGATE_SUPPLIER_CLASS_PROPERTY = "selenium.external.supplierClass";
  private static final String EXTERNAL_SERVER_URL_PROPERTY = "selenium.external.serverUrl";

  private final Capabilities desiredCapabilities;

  ExternalDriverSupplier(Capabilities desiredCapabilities) {
    this.desiredCapabilities = new ImmutableCapabilities(desiredCapabilities);
  }

  @Override
  public WebDriver get() {
    Optional<Supplier<WebDriver>> delegate = createDelegate(desiredCapabilities);
    delegate = createForExternalServer(desiredCapabilities, delegate);

    return delegate.orElse(()-> null).get();
  }

  private static Optional<Supplier<WebDriver>> createForExternalServer(
      Capabilities desiredCapabilities,
      Optional<Supplier<WebDriver>> delegate) {
    String externalUrl = System.getProperty(EXTERNAL_SERVER_URL_PROPERTY);
    if (externalUrl != null) {
      logger.info("Using external WebDriver server: " + externalUrl);
      URL url;
      try {
        url = new URL(externalUrl);
      } catch (MalformedURLException e) {
        throw new RuntimeException("Invalid server URL: " + externalUrl, e);
      }
      Supplier<WebDriver> defaultSupplier = new DefaultRemoteSupplier(url, desiredCapabilities);
      Supplier<WebDriver> supplier = new ExternalServerDriverSupplier(
          url, delegate.orElse(defaultSupplier));
      return Optional.of(supplier);
    }
    return delegate;
  }

  private static Optional<Supplier<WebDriver>> createDelegate(Capabilities desiredCapabilities) {
    Optional<Class<? extends Supplier<WebDriver>>> supplierClass = getDelegateClass();
    if (supplierClass.isPresent()) {
      Class<? extends Supplier<WebDriver>> clazz = supplierClass.get();
      logger.info("Using delegate supplier: " + clazz.getName());
      try {
        @SuppressWarnings("unchecked")
        Constructor<Supplier<WebDriver>> ctor =
            (Constructor<Supplier<WebDriver>>) clazz.getConstructor(Capabilities.class);
        return Optional.of(ctor.newInstance(desiredCapabilities));
      } catch (InvocationTargetException e) {
        throw new RuntimeException(e.getTargetException());
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }
    return Optional.empty();
  }

  @SuppressWarnings("unchecked")
  private static Optional<Class<? extends Supplier<WebDriver>>> getDelegateClass() {
    String delegateClassName = System.getProperty(DELEGATE_SUPPLIER_CLASS_PROPERTY);
    if (delegateClassName != null) {
      try {
        logger.info("Loading custom supplier: " + delegateClassName);
        Class<? extends Supplier<WebDriver>> clazz =
            (Class<? extends Supplier<WebDriver>>) Class.forName(delegateClassName);
        return Optional.of(clazz);
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }
    return Optional.empty();
  }

  /**
   * Waits for an external WebDriver server to be ready before delegating to another supplier
   * for driver creation.
   */
  private static class ExternalServerDriverSupplier implements Supplier<WebDriver> {

    private final URL serverUrl;
    private final Supplier<WebDriver> delegateSupplier;

    private ExternalServerDriverSupplier(
        URL serverUrl, Supplier<WebDriver> delegateSupplier) {
      this.serverUrl = serverUrl;
      this.delegateSupplier = delegateSupplier;
    }

    @Override
    public WebDriver get() {
      try {
        logger.info("Waiting for server to be ready at " + serverUrl);
        new UrlChecker().waitUntilAvailable(60, SECONDS, new URL(serverUrl + "/status"));
        logger.info("Server is ready");
      } catch (UrlChecker.TimeoutException e) {
        throw new RuntimeException("The external server is not accepting commands", e);
      } catch (MalformedURLException e) {
        throw new RuntimeException(e);
      }
      return delegateSupplier.get();
    }
  }

  /**
   * Creates basic {@link RemoteWebDriver} instances.
   */
  private static class DefaultRemoteSupplier implements Supplier<WebDriver> {
    private final URL url;
    private final Capabilities desiredCapabilities;

    private DefaultRemoteSupplier(URL url, Capabilities desiredCapabilities) {
      this.url = url;
      this.desiredCapabilities = desiredCapabilities;
    }

    @Override
    public WebDriver get() {
      RemoteWebDriver driver = new RemoteWebDriver(url, desiredCapabilities);
      driver.setFileDetector(new LocalFileDetector());
      return driver;
    }
  }
}
