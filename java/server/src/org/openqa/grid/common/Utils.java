package org.openqa.grid.common;

import org.openqa.selenium.remote.BrowserType;

public class Utils {

  public static String getSelenium1Equivalent(String webDriverBrowserName) {
    if (BrowserType.FIREFOX.equals(webDriverBrowserName)) {
      return "*firefox";
    }
    if ("internet explorer".equals(webDriverBrowserName)) {
      return "*iexplore";
    }
    if ("chrome".equals(webDriverBrowserName)) {
      return "*googlechrome";
    }
    return webDriverBrowserName;
  }
}
