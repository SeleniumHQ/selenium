package org.openqa.selenium.support.ui;

import org.openqa.selenium.Beta;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Objects;

@Beta
class JreBackedClock extends java.time.Clock {

  private final Clock delegate;

  public JreBackedClock(Clock delegate) {
    this.delegate = Objects.requireNonNull(delegate);
  }

  @Override
  public ZoneId getZone() {
    return null;
  }

  @Override
  public Clock withZone(ZoneId zone) {
    return null;
  }

  @Override
  public Instant instant() {
    return null;
  }
}
