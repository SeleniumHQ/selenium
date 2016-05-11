package com.thoughtworks.selenium.corerunner;

import com.google.common.base.Preconditions;

import com.thoughtworks.selenium.Selenium;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class CoreTest {

  private final String url;

  public CoreTest(String url) {
    this.url = Preconditions.checkNotNull(url);
  }

  public void run(Results results, WebDriver driver, Selenium selenium) {
    if (!driver.getCurrentUrl().equals(url)) {
      driver.get(url);
    }

    // Are we running a suite or an individual test?
    List<WebElement> allTables = driver.findElements(By.id("suiteTable"));

    if (allTables.isEmpty()) {
      new CoreTestCase(url).run(results, driver, selenium);
    } else {
      new CoreTestSuite(url).run(results, driver, selenium);
    }
  }
}
