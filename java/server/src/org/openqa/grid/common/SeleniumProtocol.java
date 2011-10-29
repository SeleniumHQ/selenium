package org.openqa.grid.common;

public enum SeleniumProtocol {
  Selenium, WebDriver;

  public boolean isSelenium(){
    return Selenium.equals(this);
  }
}
