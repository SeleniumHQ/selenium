package org.openqa.grid.common;

public class Utils {

  public static String getSelenium1Equivalent(String webDriverBrowserName) {
    if ("firefox".equals(webDriverBrowserName)) {
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
