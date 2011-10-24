package org.openqa.selenium.internal;

import org.openqa.selenium.Ignore;

public interface IgnoredTestCallback {
  void callback(String className, String testName, Ignore ignore);
}
