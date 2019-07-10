package org.openqa.selenium.testing;

public class Safely {

  public static void safelyCall(TearDownFixture... fixtures) {
    for (TearDownFixture fixture : fixtures) {
      try {
        // Fixture being null is handled by the exception check.
        fixture.tearDown();
      } catch (Exception ignored) {
        // Keep going
      }
    }
  }
}
