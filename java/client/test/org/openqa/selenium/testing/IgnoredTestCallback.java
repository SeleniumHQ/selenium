package org.openqa.selenium.testing;

public interface IgnoredTestCallback {
  void callback(Class className, String testName, Ignore ignore);
}
