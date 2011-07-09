package org.openqa.grid.e2e.misc;

import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class Selenium1WebDriverTests {


  private Hub hub;


  @BeforeClass(alwaysRun = true)
  public void setup() throws Exception {
    GridHubConfiguration config = new GridHubConfiguration();
    config.setPort(PortProber.findFreePort());
    hub = new Hub(config);
    hub.start();

    // register a selenium 1
    SelfRegisteringRemote selenium1 = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.REMOTE_CONTROL);
    selenium1.addBrowser(new DesiredCapabilities("*firefox", "3.6", Platform.getCurrent()), 1);
    selenium1.startRemoteServer();
    selenium1.sendRegistrationRequest();


    // register a webdriver
    SelfRegisteringRemote webdriver = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.WEBDRIVER);
    webdriver.addBrowser(DesiredCapabilities.firefox(), 1);
    webdriver.startRemoteServer();
    webdriver.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 2);


  }

  @Test
  public void test() throws MalformedURLException {
    String url = "http://" + hub.getHost() + ":" + hub.getPort() + "/grid/console";
    System.out.println(url);

    Selenium selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox", url);
    Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);
    selenium.start();
    Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 1);
    selenium.open(url);
    Assert.assertTrue("Grid overview".equals(selenium.getTitle()));
    selenium.stop();

    DesiredCapabilities ff = DesiredCapabilities.firefox();
    URL hubUrl = new URL("http://" + hub.getHost() + ":" + hub.getPort() + "/grid/driver");
    WebDriver driver = new RemoteWebDriver(hubUrl, ff);

    driver.get(url);
    Assert.assertEquals(driver.getTitle(), "Grid overview");
    driver.quit();

  }
}
