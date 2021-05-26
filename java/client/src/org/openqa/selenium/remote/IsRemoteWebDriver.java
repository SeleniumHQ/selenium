package org.openqa.selenium.remote;

import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.PrintsPage;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Interactive;
import org.openqa.selenium.virtualauthenticator.HasVirtualAuthenticator;

public interface IsRemoteWebDriver extends WebDriver,
  JavascriptExecutor,
  HasInputDevices,
  HasCapabilities,
  Interactive,
  TakesScreenshot,
  HasVirtualAuthenticator,
  PrintsPage {

  public SessionId getSessionId();

}
