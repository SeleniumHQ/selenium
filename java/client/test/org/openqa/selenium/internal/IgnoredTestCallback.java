package org.openqa.selenium.internal;

import org.openqa.selenium.Ignore;

public interface IgnoredTestCallback {
  void callback(Class className, String testName, Ignore ignore);
}
