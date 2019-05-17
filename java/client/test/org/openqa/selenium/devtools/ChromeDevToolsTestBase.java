package org.openqa.selenium.devtools;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.chrome.ChromeDriver;

/**
 * Created by aohana
 */
public abstract class ChromeDevToolsTestBase extends DevToolsTestBase {

  ChromeDriver chromeDriver;

  @Before
  public void setUp() {

    super.setUp();

    chromeDriver = new ChromeDriver();
    devTools = chromeDriver.getDevTools();

    devTools.createSession();
  }


  @After
  public void terminateSession() {
    devTools.close();
    chromeDriver.quit();
  }

}
