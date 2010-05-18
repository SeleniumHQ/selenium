package org.openqa.selenium;

import junit.extensions.TestSetup;
import junit.framework.Test;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import org.openqa.selenium.internal.CommandLine;
import org.openqa.selenium.internal.PortProber;

import static org.openqa.selenium.internal.PortProber.pollPort;

public class SeleniumServerStarter extends TestSetup {

  private static final String SELENIUM_JAR = "build/remote/server/server-standalone.jar";
  private CommandLine command;

  public SeleniumServerStarter(Test test) {
    super(test);
  }

  @Override
  protected void setUp() throws Exception {
    // Walk up the path until we find the "third_party/selenium" directory
    File seleniumJar = findSeleniumJar();

    if (!seleniumJar.exists()) {
      throw new IllegalStateException("Cannot locate selenium jar");
    }

    String port = startSeleniumServer(seleniumJar);

    // Wait until the server process is running (port 4444)
    if (!pollPort(Integer.valueOf(port))) {
      throw new RuntimeException("Unable to start selenium server");
    }

    super.setUp();
  }

  private String startSeleniumServer(File seleniumJar) throws IOException {
    String port = System.getProperty("webdriver.selenium.server.port", "5555");

    command = new CommandLine("java", "-jar", seleniumJar.getAbsolutePath(), "-port", port);
    command.executeAsync();

    return port;
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

    super.tearDown();
  }
}
