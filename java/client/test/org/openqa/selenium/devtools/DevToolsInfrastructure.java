package org.openqa.selenium.devtools;

import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;

public class DevToolsInfrastructure {

  ChromeDriver chromeDriver;
  DevTools devTools;
  final String TEST_WEB_SITE_ADDRESS = "https://www.seleniumhq.org/";

  @BeforeClass
  public void setUp(){
    chromeDriver = new ChromeDriver();
    devTools = chromeDriver.getDevTools();
    devTools.createSession();
  }


  @AfterClass
  public void terminateSession(){
    devTools.close();
    chromeDriver.quit();
  }

}
