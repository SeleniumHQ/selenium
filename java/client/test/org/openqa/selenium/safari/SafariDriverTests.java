/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.safari;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assume.assumeThat;

import org.openqa.selenium.By;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
public class SafariDriverTests {
  
  private WebDriver driver = null;
  
  private static boolean isSupportedPlatform() {
    Platform current = Platform.getCurrent();
    return Platform.MAC.is(current) || Platform.WINDOWS.is(current);
  }
  
  @Before
  public void createDriver() {
    assumeThat(isSupportedPlatform(), is(true));
    driver = new SafariDriver();
  }
  
  @After
  public void quitDriver() {
    driver.quit();
  }
  
  @Test
  public void shouldBeAbleToPerformAGoogleSearch() {
    driver.get("http://www.google.com");

    WebElement searchBox = driver.findElement(By.name("q"));
    assertEquals("input", searchBox.getTagName().toLowerCase());

    searchBox.sendKeys("webdriver");
    assertEquals("webdriver", searchBox.getAttribute("value"));
    
    searchBox.submit();

    new WebDriverWait(driver, 3)
        .until(ExpectedConditions.titleIs("webdriver - Google Search"));
    // If we don't time out, we're good to go.
  }
}
