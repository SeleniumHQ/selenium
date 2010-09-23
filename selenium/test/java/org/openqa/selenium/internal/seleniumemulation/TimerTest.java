package org.openqa.selenium.internal.seleniumemulation;

import junit.framework.TestCase;

import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.WebDriver;

public class TimerTest extends TestCase {

  public void testCannotExecuteCommandsAfterStoppingTheTimer() {
    Timer timer = new Timer(250);
    timer.stop();
    try {
      timer.run(new SeleneseCallable(5), null, new String[0]);
      fail();
    } catch (IllegalStateException ex) {
      // expected
    }
  }

  public void testShouldTimeOut() throws Exception {
    Timer timer = new Timer(10);
    try {
      timer.run(new SeleneseCallable(60), null, new String[0]);
    } catch (SeleniumException e) {
      timer.stop();
      return;
    }
    fail("Expecting timeout");
  }


  public void testShouldNotTimeOut() throws Exception {
    Timer timer = new Timer(200);
    timer.run(new SeleneseCallable(10), null, new String[0]);
    timer.stop();
  }


  class SeleneseCallable extends SeleneseCommand<Object> {
    final int waitFor;

    SeleneseCallable(int waitFor) {
      this.waitFor = waitFor;
    }

    @Override
    protected Object handleSeleneseCommand(WebDriver driver, String locator, String value) {
      try {
        Thread.sleep(waitFor);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }
      return new Object();
    }
  }
}
