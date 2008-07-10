package org.openqa.selenium.remote.server;

import java.util.concurrent.Callable;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.FutureTask;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.OperatingSystem;
import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.remote.Context;
import org.openqa.selenium.remote.DesiredCapabilities;

public class Session {
  private final WebDriver driver;
  private KnownElements knownElements = new KnownElements();
  private Capabilities capabilities;
  private Executor executor;

  public Session(DriverSessions parent, final Capabilities capabilities) throws Exception {
    if (isDriverRequiringGlobalThread(capabilities)) {
      this.executor = parent.getExecutor();
    } else {
      this.executor = Executors.newSingleThreadExecutor();
    }

    // Ensure that the browser is created on the single thread.
    FutureTask<WebDriver> createBrowser = new FutureTask<WebDriver>(new Callable<WebDriver>() {
      public WebDriver call() throws Exception {
        return createNewDriverMatching(capabilities);
      }
    });
    execute(createBrowser);
    this.driver = createBrowser.get();

    boolean isRendered = isRenderingDriver(capabilities);
    DesiredCapabilities desiredCapabilities =
        new DesiredCapabilities(capabilities.getBrowserName(), capabilities.getVersion(),
                                capabilities.getOperatingSystem());
    desiredCapabilities.setJavascriptEnabled(isRendered);

    this.capabilities = desiredCapabilities;
  }

  private boolean isDriverRequiringGlobalThread(Capabilities capabilities) {
    return "internet explorer".equals(capabilities.getBrowserName());
  }

  public <X> X execute(FutureTask<X> future) throws Exception {
    executor.execute(future);
    return future.get();
  }

  public WebDriver getDriver(Context context) {
    return driver;
  }

  public KnownElements getKnownElements() {
    return knownElements;
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  private boolean isRenderingDriver(Capabilities capabilities) {
    String browser = capabilities.getBrowserName();

    return browser != null && !"".equals(browser) && !"htmlunit".equals(browser);
  }

  private WebDriver createNewDriverMatching(Capabilities capabilities) throws Exception {
    OperatingSystem os = capabilities.getOperatingSystem();
    if (os != null && !OperatingSystem.ANY.equals(os) && !OperatingSystem.getCurrentPlatform()
        .equals(os)) {
      throw new RuntimeException("Desired operating system does not match current OS");
    }

    String browser = capabilities.getBrowserName();
    if (browser != null) {
      return createNewInstanceOf(browser);
    }

    if (capabilities.isJavascriptEnabled()) {
      return (WebDriver) Class.forName("org.openqa.selenium.firefox.FirefoxDriver")
          .newInstance();
    }

    return (WebDriver) Class.forName("org.openqa.selenium.htmlunit.HtmlUnitDriver")
        .newInstance();
  }

  private WebDriver createNewInstanceOf(String browser) throws Exception {
    if ("htmlunit".equals(browser)) {
      return (WebDriver) Class.forName("org.openqa.selenium.htmlunit.HtmlUnitDriver")
          .newInstance();
    } else if ("firefox".equals(browser)) {
      return (WebDriver) Class.forName("org.openqa.selenium.firefox.FirefoxDriver")
          .newInstance();
    } else if ("internet explorer".equals(browser)) {
      return (WebDriver) Class.forName("org.openqa.selenium.ie.InternetExplorerDriver")
          .newInstance();
    } else if ("safari".equals(browser)) {
      return (WebDriver) Class.forName("org.openqa.selenium.safari.SafariDriver")
          .newInstance();
    }

    throw new RuntimeException("Unable to match browser: " + browser);
  }
}
