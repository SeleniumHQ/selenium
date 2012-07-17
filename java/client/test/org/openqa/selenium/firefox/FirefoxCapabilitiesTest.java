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

package org.openqa.selenium.firefox;

import static org.junit.Assert.fail;
import static org.junit.Assume.assumeTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

@NeedsLocalEnvironment
public class FirefoxCapabilitiesTest extends JUnit4TestBase {
  
  private WebDriver localDriver;
  
  @Before
  public void checkIsFirefoxDriver() {
    assumeTrue(TestUtilities.isFirefox(driver));
  }
  
  @Test
  public void testDisableJavascriptCapability() {
    try {
      configureCapability(CapabilityType.SUPPORTS_JAVASCRIPT, false);
      fail("Disabling of Javascript for the Firefox driver should fail");
    } catch (SessionNotCreatedException expected) {
    }  
  }
  
  @Test
  public void testDisableHandlesAlertsCapability() {
    try {
      configureCapability(CapabilityType.SUPPORTS_ALERTS, false);
      fail("Disabling of alerts for the Firefox driver should fail");
    } catch (SessionNotCreatedException expected) {
    }
  }
  
  @Test
  public void testDisableCssSelectorCapability() {
    try {
      configureCapability(CapabilityType.SUPPORTS_FINDING_BY_CSS, false);
      fail("Disabling of CSS selectors for the Firefox driver should fail");
    } catch (SessionNotCreatedException expected) {
    }
  }

  @Test
  public void testDisableScreenshotCapability() {
    try {
      configureCapability(CapabilityType.TAKES_SCREENSHOT, false);
      fail("Disabling of screenshot capability for the Firefox driver should fail");
    } catch (SessionNotCreatedException expected) {
    }
  }

  @Test 
  public void testEnableRotatableCapability() {
    try {
      configureCapability(CapabilityType.ROTATABLE, true);
      fail("Enabling of rotatable capability for the Firefox driver should fail");
    } catch (SessionNotCreatedException expected) {
    }
  }
      
  private void configureCapability(String capability, boolean isEnabled) {
    DesiredCapabilities requiredCaps = new DesiredCapabilities();
    requiredCaps.setCapability(capability, isEnabled);
    WebDriverBuilder builder = new WebDriverBuilder().setRequiredCapabilities(requiredCaps);
    localDriver = builder.get();    
  }
  
  @After
  public void quitDriver() {
    if (this.localDriver != null) {
      this.localDriver.quit();
      this.localDriver = null;
    }
  } 
}
