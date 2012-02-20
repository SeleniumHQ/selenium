package org.openqa.selenium.rc;

import com.google.common.base.Throwables;
import com.google.common.io.Files;

import org.json.JSONObject;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.Build;
import org.openqa.selenium.Pages;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.HttpRequest;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.testing.SeleniumTestRunner;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;

import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.remote.HttpRequest.Method.DELETE;
import static org.openqa.selenium.remote.HttpRequest.Method.GET;
import static org.openqa.selenium.remote.HttpRequest.Method.POST;
import static org.openqa.selenium.remote.HttpRequest.Method.PUT;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

@Ignore(value = {ANDROID, IE, IPHONE, SELENESE},
        reason = "Not tested on these browsers yet.")
@RunWith(SeleniumTestRunner.class)
public class SetProxyTest {

  private static BrowserMobProxyServer proxyServer;
  private static Pages pages;
  private ProxyInstance instance;

  @BeforeClass
  public static void startProxy() {
    TestEnvironment environment = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    pages = new Pages(environment.getAppServer());
    proxyServer = new BrowserMobProxyServer();
  }

  @AfterClass
  public static void detroyProxy() {
    proxyServer.destroy();
  }

  @Before
  public void newProxyInstance() {
    instance = proxyServer.newInstance();
  }

  @After
  public void deleteProxyInstance() {
    instance.destroy();
  }

  @Test
  public void shouldAllowProxyToBeSetViaTheCapabilities() {
    Proxy proxy = instance.asProxy();

    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(PROXY, proxy);

    WebDriver driver = new WebDriverBuilder().setCapabilities(caps).get();

    driver.get(pages.simpleTestPage);
    driver.quit();

    assertTrue(instance.hasBeenCalled());
  }

  @Test
  public void shouldAllowProxyToBeConfiguredAsAPac() throws IOException {
    String pac = String.format(
        "function FindProxyForURL(url, host) {\n" +
        "  return 'PROXY http://%s:%d';\n" +
        "}", new NetworkUtils().getPrivateLocalAddress(), instance.port);
    File tempDir = new File(System.getProperty("java.io.tmpdir"));
    TemporaryFilesystem tempFs = TemporaryFilesystem.getTmpFsBasedOn(tempDir);
    File pacFile = new File(tempDir, "proxy.pac");
    // Use the default platform charset because otherwise IE gets upset. Apparently.
    Files.write(pac, pacFile, Charset.defaultCharset());

    String autoConfUrl = pacFile.toURI().toString();
    if (!autoConfUrl.startsWith("file://")) {
      autoConfUrl = autoConfUrl.replace("file:/", "file://");
    }

    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl(autoConfUrl);

    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(PROXY, proxy);

    WebDriver driver = new WebDriverBuilder().setCapabilities(caps).get();

    driver.get(pages.simpleTestPage);
    driver.quit();
    tempFs.deleteTemporaryFiles();

    assertTrue(instance.hasBeenCalled());
  }

  private static class BrowserMobProxyServer {

    private CommandLine process;
    private String proxyUrl;

    public BrowserMobProxyServer() {
      // We need to run out of process as the browsermob proxy has a dependency
      // on the Selenium Proxy interface, which may change.
      new Build().of("//third_party/java/browsermob_proxy:browsermob_proxy:uber").go();
      String browserBinary = InProject.locate(
          "build/third_party/java/browsermob_proxy/browsermob_proxy-standalone.jar")
          .getAbsolutePath();
      int port = PortProber.findFreePort();
      process = new CommandLine("java", "-jar", browserBinary, "--port", String.valueOf(port));
      process.copyOutputTo(System.err);
      process.executeAsync();

      PortProber.pollPort(port);

      String address = new NetworkUtils().getPrivateLocalAddress();
      proxyUrl = String.format("http://%s:%d", address, port);
    }

    public ProxyInstance newInstance() {
      try {
        HttpRequest request = new HttpRequest(POST, proxyUrl + "/proxy", null);
        JSONObject proxyDetails = new JSONObject(request.getResponse());
        int port = proxyDetails.getInt("port");
        // Wait until the proxy starts and is listening
        PortProber.pollPort(port);

        // Start recording requests
        new HttpRequest(PUT, String.format("%s/proxy/%d/har", proxyUrl, port), null);

        return new ProxyInstance(proxyServer.proxyUrl, port);
      } catch (Exception e) {
        throw Throwables.propagate(e);
      }
    }

    public void destroy() {
      process.destroy();
    }
  }

  private static class ProxyInstance {

    private final String baseUrl;
    private final int port;

    public ProxyInstance(String baseUrl, int port) {
      this.baseUrl = baseUrl;
      this.port = port;
    }

    public boolean hasBeenCalled() {
      String url = String.format("%s/proxy/%d/har", baseUrl, port);
      HttpRequest request = new HttpRequest(GET, url, null);
      String response = request.getResponse();

      return response.length() > 0;
    }

    public void destroy() {
      try {
        String url = String.format("%s/proxy/%d", baseUrl, port);
        new HttpRequest(DELETE, url, null);
      } catch (Exception e) {
        throw Throwables.propagate(e);
      }
    }

    public Proxy asProxy() {
      Proxy proxy = new Proxy();
      String address = new NetworkUtils().getPrivateLocalAddress();
      String format = String.format("%s:%d", address, port);
      proxy.setHttpProxy(format);
      return proxy;
    }
  }
}
