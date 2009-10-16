package org.openqa.selenium.internal.selenesedriver;

import com.thoughtworks.selenium.Selenium;

public interface SeleneseFunction<T> {
  T apply(Selenium selenium, Object... args);
}
