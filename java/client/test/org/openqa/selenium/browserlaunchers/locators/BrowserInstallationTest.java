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

package org.openqa.selenium.browserlaunchers.locators;

import static org.junit.Assert.assertTrue;

import org.junit.Ignore;
import org.junit.Test;

public class BrowserInstallationTest {
  @Test @Ignore(value="comment this ignore to test.  this test is too dependent to be enabled on a CI") // remove the ignore to test.
  public void testBrowserInstallations() {
    // since some browsers might not exist on some machines, nor should that be required -
    // this is just used for internal validation purposes, rather than an actual unit test.

    assertTrue(BrowserInstallation.isGoogleChromeInstalled());
    assertTrue(BrowserInstallation.isFirefoxInstalled());
    assertTrue(BrowserInstallation.isSafariInstalled());

    System.out.println(BrowserInstallation.getFirefoxInstallationBinary());
    assertTrue(BrowserInstallation.getFirefoxInstallationBinary() != null);

    System.out.println(BrowserInstallation.getGoogleChromeInstallationBinary());
    assertTrue(BrowserInstallation.getGoogleChromeInstallationBinary() != null);

    System.out.println(BrowserInstallation.getSafariInstallationBinary());
    assertTrue(BrowserInstallation.getSafariInstallationBinary() != null);
  }
}
