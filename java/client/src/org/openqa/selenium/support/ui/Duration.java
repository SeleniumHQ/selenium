package org.openqa.selenium.support.ui;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import com.google.common.base.Objects;

import java.util.concurrent.TimeUnit;

/**
 * Represents an immutable duration of time.
 */
public class Duration {

  private final long time;
  private final TimeUnit unit;

  /**
   * @param time The amount of time.
   * @param unit The unit of time.
   */
  public Duration(long time, TimeUnit unit) {
    checkArgument(time >= 0, "Duration < 0: %d", time);
    checkNotNull(unit);
    this.time = time;
    this.unit = unit;
  }

  @Override
  public boolean equals(Object o) {
    if (o instanceof Duration) {
      Duration other = (Duration) o;
      return this.time == other.time
          && this.unit == other.unit;
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(time, unit);
  }

  @Override
  public String toString() {
    return String.format("%d %s", time, unit);
  }

  /**
   * Converts this durtation to the given unit of time.
   * 
   * @param unit The time unit to convert to.
   * @return The value ofthis duration in the specified unit of time.
   */
  public long in(TimeUnit unit) {
    return unit.convert(time, this.unit);
  }
}
