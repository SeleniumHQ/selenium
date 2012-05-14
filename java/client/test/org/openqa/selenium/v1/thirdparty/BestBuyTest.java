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


package org.openqa.selenium.v1.thirdparty;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.testng.annotations.Test;

public class BestBuyTest extends InternalSelenseTestBase {

  public static String TIMEOUT = "30000";

  @Test(dataProvider = "system-properties")
  public void searchAndSignup() {
    selenium.open("http://www.bestbuy.com/");
    selenium.type("st", "Wii");
    selenium.click("goButton");
    selenium.waitForPageToLoad(TIMEOUT);
    selenium.click("link=Nintendo - Wii");
    selenium.waitForPageToLoad(TIMEOUT);
    selenium.click("&lid=accessories");
    selenium.waitForPageToLoad(TIMEOUT);
    selenium.click("addtowishlist");
    selenium.waitForPageToLoad(TIMEOUT);
    selenium.click("link=create one now");
    selenium.waitForPageToLoad(TIMEOUT);
    selenium.type("TxtFirstName", "Patrick");
    selenium.type("TxtLastName", "Lightbody");
    selenium.click("CmdCreate");
    selenium.waitForPageToLoad(TIMEOUT);
    assertTrue(selenium.isTextPresent("Please enter your e-mail address"));
    assertTrue(selenium.isTextPresent("Please enter your password"));
    assertTrue(selenium.isTextPresent("Please enter a 5-digit ZIP code"));
  }
}
