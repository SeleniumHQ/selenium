package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

public class CaptureScreenshotToString extends SeleneseCommand<String> {
  @Override
  protected String handleSeleneseCommand(WebDriver driver, String locator, String value) {
    if (driver instanceof TakesScreenshot) {
      TakesScreenshot tsDriver = (TakesScreenshot) driver;
      return tsDriver.getScreenshotAs(OutputType.BASE64);
    } else {
      throw new UnsupportedOperationException("WebDriver does not implement TakeScreenshot");
    }
  }
}
