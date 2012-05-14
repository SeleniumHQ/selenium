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

public class BBCTest extends InternalSelenseTestBase {
  @Test(dataProvider = "system-properties")
  public void haveYourSaySignup() {
    selenium.open("http://www.bbc.co.uk/?ok");
    selenium.type("searchfield", "iraq");
    selenium.click("Search");
    selenium.waitForPageToLoad("30000");
    assertTrue(selenium.isTextPresent("Results from All of the BBC"));
    selenium.click("link=Home");
    selenium.waitForPageToLoad("30000");
    selenium.click("link=News");
    selenium.waitForPageToLoad("30000");
    selenium.click("link=Have Your Say");
    selenium.waitForPageToLoad("30000");
    selenium.click("link=exact:Have you got a good story? What do you want to talk about?");
    selenium.waitForPageToLoad("30000");
    selenium.click("link=Click here to participate in the debate");
    selenium.waitForPageToLoad("30000");
    selenium.click("//img[@alt='Create your membership']");
    selenium.waitForPageToLoad("30000");
    selenium
        .click("//input[@src='/newsandsportsso/haveyoursay/sso_resources/images/buttons/goto2_1.gif']");
    selenium.waitForPageToLoad("30000");
    assertTrue(selenium.isTextPresent("You left both passwords blank"));

  }
}
