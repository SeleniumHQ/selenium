package org.openqa.selenium;

import junit.framework.TestCase;

import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.browserlaunchers.CapabilityType;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.internal.CommandLine;
import org.openqa.selenium.remote.HttpRequest;

import static org.openqa.selenium.Ignore.Driver.ALL;
import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer.ENSURING_CLEAN_SESSION;
import static org.openqa.selenium.browserlaunchers.CapabilityType.PROXY;
import static org.openqa.selenium.internal.PortProber.findFreePort;
import static org.openqa.selenium.internal.PortProber.pollPort;

// This test only makes sense for IE, but needs a lot of supporting code.
@Ignore(value = ALL, reason = "Needs to be run manually")
public class SetProxyTest extends TestCase {
  private DefaultProxy proxyInstance = new DefaultProxy();
  private TestEnvironment env;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    env = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    proxyInstance.start();
  }

  @Override
  protected void tearDown() throws Exception {
    proxyInstance.stop();
    env.stop();

    super.tearDown();
  }

  @NoDriverAfterTest
  public void testCanMakeIeDriverUseASpecifiedProxy() throws Exception {
    Proxy proxy = new Proxy();
    // TODO(simon): Modify the proxy to make the port configurable
    proxy.setHttpProxy("localhost:9638");

    Map<String, Object> raw = new HashMap<String, Object>();
    raw.put(PROXY, proxy);
    raw.put(ENSURING_CLEAN_SESSION, true);
    Capabilities caps = new MappedCapabilities(raw);

    InternetExplorerDriver driver = new InternetExplorerDriver(caps);

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
        "http://localhost:" + proxyInstance.getPort() + "/dwr/call/plaincall/ProxyServer.getBlocks.dwr", payload);
    String response = request.getResponse();
    return response;
  }

  private static class DefaultProxy {
    private int port;
    private CommandLine command;

    public void start() {
      port = findFreePort();

      command = new CommandLine(
          "java", "-jar", "third_party/java/browsermob_proxy/browsermob-proxy-1.0-SNAPSHOT-release.jar",
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

  private static class MappedCapabilities implements Capabilities {
    private Map<String, Object> caps;

    public MappedCapabilities(Map<String, Object> caps) {
      this.caps = caps;
    }

    public String getBrowserName() {
      return (String) caps.get(CapabilityType.BROWSER_NAME);
    }

    public Platform getPlatform() {
      return (Platform) caps.get(CapabilityType.PLATFORM);
    }

    public String getVersion() {
      return (String) caps.get(CapabilityType.VERSION);
    }

    public boolean isJavascriptEnabled() {
      return is(CapabilityType.SUPPORTS_JAVASCRIPT);
    }

    public Map<String, Object> asMap() {
      return caps;
    }

    public Object getCapability(String capabilityName) {
      return caps.get(capabilityName);
    }

    public boolean is(String capabilityName) {
      Object value = getCapability(capabilityName);
      if (value == null) {
        return false;
      }

      return value instanceof Boolean ? ((Boolean) value).booleanValue() : false;
    }
  }
}
