package org.openqa.selenium;

import junit.extensions.TestSetup;
import junit.framework.Test;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.*;

public class SeleniumServerStarter extends TestSetup {

  private static final String SELENIUM_JAR = "build/selenium-server-standalone.jar";
  private Process serverProcess;

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
    pollPort(Integer.valueOf(port));

    new Thread(new Runnable() {
      public void run() {
        InputStream is = serverProcess.getInputStream();
        try {
          int c = 0;
          while ((c = is.read()) != -1) {
            System.err.print((char) c);
          }
        } catch (IOException e) {
        }
      }
    }).start();

    super.setUp();
  }

  private String startSeleniumServer(File seleniumJar) throws IOException {
    String port = System.getProperty("webdriver.selenium.server.port", "5555");
    ProcessBuilder builder = new ProcessBuilder(
        "java", "-jar", seleniumJar.getAbsolutePath(),
        "-port", port);
    builder.redirectErrorStream(true);
    serverProcess = builder.start();
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

  private void pollPort(int port) {
    long end = System.currentTimeMillis() + 150000;
    while (System.currentTimeMillis() < end) {
      try {
        InetSocketAddress address = new InetSocketAddress(InetAddress.getByName(null), port);

        Socket socket = new Socket();
        socket.connect(address, 15000);
        return;
      } catch (ConnectException e) {
        // Ignore this
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }
  }

  @Override
  protected void tearDown() throws Exception {
    if (serverProcess != null) {
      serverProcess.destroy();
    }

    super.tearDown();
  }
}
