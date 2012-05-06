package org.openqa.selenium.javascript;

import java.util.concurrent.TimeUnit;

public interface TestEventSupplier {
  TestEvent getTestEvent(long time, TimeUnit unit) throws InterruptedException;
}
