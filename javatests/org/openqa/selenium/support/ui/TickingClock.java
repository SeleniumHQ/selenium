package org.openqa.selenium.support.ui;

public class TickingClock implements Clock {
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
    now += incrementMillis;
    return now < endInMillis;
  }
}