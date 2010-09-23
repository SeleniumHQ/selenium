package org.openqa.selenium.internal.seleniumemulation;

import junit.framework.TestCase;

import java.util.concurrent.Callable;

public class TimerTest extends TestCase {

  public void testCannotExecuteCommandsAfterStoppingTheTimer() {
    Timer timer = new Timer(250);
    timer.stop();
    timer.run(new Callable<Void>() {
      public Void call() throws Exception {
        return null;
      }
    });
  }
}
