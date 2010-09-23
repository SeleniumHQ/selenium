package org.openqa.selenium.internal.seleniumemulation;

import junit.framework.TestCase;

import java.util.concurrent.Callable;
import java.util.concurrent.RejectedExecutionException;

public class TimerTest extends TestCase {

  public void testCannotExecuteCommandsAfterStoppingTheTimer() {
    Timer timer = new Timer(250);
    timer.stop();
    try {
      timer.run(new Callable<Void>() {
        public Void call() throws Exception {
          return null;
        }
      });
      fail();
    } catch (RuntimeException ex) {
      Throwable cause = ex.getCause();
      assertNotNull(cause);
      assertTrue(cause instanceof RejectedExecutionException);
    }
  }
}
