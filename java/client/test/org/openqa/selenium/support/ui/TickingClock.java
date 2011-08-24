package org.openqa.selenium.support.ui;

import java.util.concurrent.TimeUnit;

public class TickingClock implements Clock, Sleeper {
  private final long incrementMillis;
  private long now = 0;

  public TickingClock(long incrementMillis) {
    this.incrementMillis = incrementMillis;
  }

  public long now() {
    return now;
  }

  public long laterBy(long durationInMillis) {
    return now + durationInMillis;
  }

  public boolean isNowBefore(long endInMillis) {
    return now < endInMillis;
  }

  public void sleep(Duration duration) {
    now += duration.in(TimeUnit.MILLISECONDS);
  }
}
