package org.openqa.selenium.devtools.network.model;

import java.time.Instant;
import java.util.Objects;

public class MonotonicTime {

  private Instant timestamp;

  public static MonotonicTime parse(Number nextNumber) {
    MonotonicTime monotonicTime = new MonotonicTime();
    monotonicTime.setTimeStamp(nextNumber);
    return monotonicTime;
  }

  public Instant getTimeStamp() {
    return timestamp;
  }

  private void setTimeStamp(Number timeStamp) {
    Objects.requireNonNull(timeStamp,"'timestamp' is require for MonotonicTime");
    this.timestamp = Instant.ofEpochSecond(timeStamp.longValue());
  }
}
