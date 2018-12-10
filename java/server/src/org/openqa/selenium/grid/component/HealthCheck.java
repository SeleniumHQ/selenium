package org.openqa.selenium.grid.component;

import java.util.Objects;

@FunctionalInterface
public interface HealthCheck {

  Result check();

  class Result {
    private final boolean isAlive;
    private final String message;

    public Result(boolean isAlive, String message) {
      this.isAlive = isAlive;
      this.message = Objects.requireNonNull(message, "Message must be set");
    }

    public boolean isAlive() {
      return isAlive;
    }

    public String getMessage() {
      return message;
    }
  }
}