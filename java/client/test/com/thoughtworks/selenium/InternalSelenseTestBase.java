package com.thoughtworks.selenium;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.v1.SeleniumTestEnvironment;
import org.testng.Assert;

import java.io.IOException;
import java.net.URL;

public class InternalSelenseTestBase extends SeleneseTestBase {
  @BeforeClass
  public static void initializeServer() {
    GlobalTestEnvironment.get(SeleniumTestEnvironment.class);
  }

  @Before
  public void addNecessaryJavascriptCommands() {
    if (selenium == null || !(selenium instanceof WebDriverBackedSelenium)) {
      return;
    }

    // We need to be a on page where we can execute JS
    WebDriver driver = ((WrapsDriver) selenium).getWrappedDriver();
    driver.get(whereIs("/selenium-server"));

    try {
      URL scriptUrl = Resources.getResource(getClass(), "/com/thoughtworks/selenium/testHelpers.js");
      String script = Resources.toString(scriptUrl, Charsets.UTF_8);

      ((JavascriptExecutor) driver).executeScript(script);
    } catch (IOException e) {
      Assert.fail("Cannot read script", e);
    }
  }

  private String whereIs(String location) {
    return GlobalTestEnvironment.get().getAppServer().whereIs(location);
  }

  @Before
  public void returnFocusToMainWindow() {
    if (selenium == null) {
      return;
    }
    selenium.selectWindow("");
  }

  @Before
  public void initializeSelenium() {
    selenium = ((SeleniumTestEnvironment) GlobalTestEnvironment.get())
        .getSeleniumInstance(runtimeBrowserString());
  }

  @After
  public void checkVerifications() {
    checkForVerificationErrors();
  }
}
