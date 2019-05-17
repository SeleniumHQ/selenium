package org.openqa.selenium.devtools;

import org.junit.Before;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.testing.Pages;


public abstract class DevToolsTestBase {

  DevTools devTools;
  protected TestEnvironment environment;
  protected AppServer appServer;
  protected Pages pages;

  @Before
  public void setUp() {

    environment = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    appServer = environment.getAppServer();
    pages = new Pages(appServer);

  }

}
