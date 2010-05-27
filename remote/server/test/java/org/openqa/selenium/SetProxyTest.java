package org.openqa.selenium;

import junit.framework.TestCase;

import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.internal.CommandLine;
import org.openqa.selenium.internal.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.HttpRequest;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

import static org.openqa.selenium.Ignore.Driver.ALL;
import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer.ENSURING_CLEAN_SESSION;
import static org.openqa.selenium.browserlaunchers.CapabilityType.PROXY;
import static org.openqa.selenium.internal.PortProber.findFreePort;
import static org.openqa.selenium.internal.PortProber.pollPort;

// This test only makes sense for IE, but needs a lot of supporting code.
@Ignore(value = ALL, reason = "Needs to be run manually")
public class SetProxyTest extends TestCase {
  private DefaultProxy proxyInstance = new DefaultProxy();
  private SeleniumServerInstance seleniumServer = new SeleniumServerInstance();
  private TestEnvironment env;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    env = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    seleniumServer.start();
    proxyInstance.start();
  }

  @Override
  protected void tearDown() throws Exception {
    proxyInstance.stop();
    seleniumServer.stop();
    env.stop();

    super.tearDown();
  }

  @NoDriverAfterTest
  public void testCanMakeIeDriverUseASpecifiedProxy() throws Exception {
    System.setProperty("webdriver.development", "true");
    System.setProperty("jna.library.path", "..\\build;build");

    Proxy proxy = new Proxy();
    // TODO(simon): Modify the proxy to make the port con4figurable
    proxy.setHttpProxy("localhost:9638");

    DesiredCapabilities caps = DesiredCapabilities.internetExplorer();
    caps.setCapability(PROXY, proxy);
    caps.setCapability(ENSURING_CLEAN_SESSION, true);

    WebDriver driver = new RemoteWebDriver(seleniumServer.getWebDriverUrl(), caps);
//    InternetExplorerDriver driver = new InternetExplorerDriver(caps);

    driver.get(new Pages(env.getAppServer()).xhtmlTestPage);
    driver.quit();

    String response = getBlocks();
    assertTrue(response, response.contains("xhtmlTest.html"));
  }

  private String getBlocks() throws Exception {
    String payload = "callCount=1\n"
                     + "windowName=\n"
                     + "c0-scriptName=ProxyServer\n"
                     + "c0-methodName=getBlocks\n"
                     + "c0-id=0\n"
                     + "batchId=3\n"
                     + "page=/\n"
                     + "httpSessionId=njh9zqjbhyhe\n"
                     + "scriptSessionId=74C83DBD88D9E47B8464C2B6DA9190D2";
    HttpRequest request = new HttpRequest(HttpRequest.Method.POST,
        "http://localhost:" + proxyInstance.getPort()
        + "/dwr/call/plaincall/ProxyServer.getBlocks.dwr", payload);
    String response = request.getResponse();
    return response;
  }

  private static class DefaultProxy {
    private int port;
    private CommandLine command;

    public void start() {
      port = findFreePort();

      command = new CommandLine(
          "java", "-jar",
          "third_party/java/browsermob_proxy/browsermob-proxy-1.0-SNAPSHOT-release.jar",
          "-port=" + port);
      command.executeAsync();

      pollPort(port);
    }

    public void stop() {
      command.destroy();
    }

    public int getPort() {
      return port;
    }
  }

  private static class SeleniumServerInstance {
    private SeleniumServer seleniumServer;
    private int serverPort;

    public void start() throws Exception {
      serverPort = PortProber.findFreePort();
      RemoteControlConfiguration config = new RemoteControlConfiguration();
      config.setPort(serverPort);
      seleniumServer = new SeleniumServer(config);
      seleniumServer.boot();
    }

    public void stop() {
      seleniumServer.stop();
    }

    public int getPort() {
      return serverPort;
    }

    public URL getWebDriverUrl() throws MalformedURLException {
      return new URL("http://localhost:" + serverPort + "/wd/hub");
    }
  }
}
