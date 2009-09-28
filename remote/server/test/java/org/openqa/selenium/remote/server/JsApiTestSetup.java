package org.openqa.selenium.remote.server;

import org.openqa.selenium.WebDriver;

import junit.extensions.TestSetup;
import junit.framework.Test;

/**
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class JsApiTestSetup extends TestSetup {

  private final JsApiTestServer testServer;
  private final WebDriver driver;

  public JsApiTestSetup(Test test, JsApiTestServer testServer, WebDriver driver) {
    super(test);
    this.testServer = testServer;
    this.driver = driver;
  }

  @Override
  protected void setUp() throws Exception {
    Thread t = new Thread() {
      @Override
      public void run() {
        testServer.start();
      }
    };
    t.setDaemon(true);
    t.start();
    Thread.sleep(1000);
  }

  @Override
  protected void tearDown() throws Exception {
    testServer.stop();
    driver.quit();
  }
}
