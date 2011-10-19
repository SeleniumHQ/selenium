package org.openqa.selenium.v1;

import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.net.PortProber.freeLocalPort;
import static org.openqa.selenium.net.PortProber.pollPort;

import static java.util.concurrent.TimeUnit.SECONDS;

import org.openqa.selenium.Build;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.os.CommandLine;

import junit.extensions.TestSetup;
import junit.framework.Test;

import java.io.File;
import java.net.URL;
import java.util.concurrent.TimeUnit;

@SuppressWarnings({"UnusedDeclaration"})
public class SeleniumServerStarter extends TestSetup {

  private static final NetworkUtils networkUtils = new NetworkUtils();
  private static final String SELENIUM_JAR =
      "build/java/server/test/org/openqa/selenium/server-with-tests-standalone.jar";
  private CommandLine command;

  public SeleniumServerStarter(Test test) {
    super(test);
  }

  @Override
  protected void setUp() throws Exception {
    // Walk up the path until we find the "third_party/selenium" directory
    File seleniumJar = findSeleniumJar();

    if (!seleniumJar.exists()) {
      new Build().of("//java/server/test/org/openqa/selenium:server-with-tests:uber").go();
      if (!seleniumJar.exists()) {
        throw new IllegalStateException("Cannot locate selenium jar");
      }
    }

    String port = startSeleniumServer(seleniumJar);

    // Wait until the server process is running (port 4444)
    if (!pollPort(Integer.valueOf(port))) {
      throw new RuntimeException("Unable to start selenium server");
    }

    URL status = new URL("http://localhost:" + port + "/wd/hub/status");
    new UrlChecker().waitUntilAvailable(60, TimeUnit.SECONDS, status);

    super.setUp();
  }

  @SuppressWarnings({"UseOfSystemOutOrSystemErr"})
  private String startSeleniumServer(File seleniumJar) {

    final String port = getPortString();
    command = new CommandLine("java", "-jar", seleniumJar.getAbsolutePath(), "-port", port);
    if (Boolean.getBoolean("webdriver.debug")) {
      command.copyOutputTo(System.err);
    }
    command.executeAsync();

    PortProber.pollPort(getPort(port));

    return port;
  }

  private int getPort(String portString) {
    return Integer.parseInt(portString);
  }

  private String getPortString() {
    int defaultPort = PortProber.findFreePort();
    return System.getProperty("webdriver.selenium.server.port", String.valueOf(defaultPort));
  }

  private File findSeleniumJar() {
    File dir = new File(".");
    File seleniumJar = null;
    while (dir != null) {
      seleniumJar = new File(dir, SELENIUM_JAR);
      if (seleniumJar.exists()) {
        break;
      }
      dir = dir.getParentFile();
    }
    return seleniumJar;
  }

  @Override
  protected void tearDown() throws Exception {
    if (command != null) {
      command.destroy();
    }

    waitFor(freeLocalPort(getPort(getPortString())), 10, SECONDS);
    super.tearDown();
  }
}
