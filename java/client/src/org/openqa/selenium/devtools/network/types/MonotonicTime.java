package org.openqa.selenium.devtools.network.types;

public class MonotonicTime {

  private Number timeStamp;

  public static MonotonicTime parse(Number nextNumber) {
    MonotonicTime monotonicTime = new MonotonicTime();
    monotonicTime.setTimeStamp(nextNumber);
    return monotonicTime;
  }

  public Number getTimeStamp() {
    return timeStamp;
  }

  public void setTimeStamp(Number timeStamp) {
    this.timeStamp = timeStamp;
  }
}
