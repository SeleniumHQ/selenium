package org.openqa.selenium.devtools;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.chrome.ChromeDriver;

public class DevToolsInfrastructureTest {

  ChromeDriver chromeDriver;
  DevTools devTools;
  final String TEST_WEB_SITE_ADDRESS = "https://www.seleniumhq.org/";

  @Before
  public void setUp(){
    chromeDriver = new ChromeDriver();
    devTools = chromeDriver.getDevTools();
    devTools.createSession();
  }


  @After
  public void terminateSession(){
    devTools.close();
    chromeDriver.quit();
  }

}
