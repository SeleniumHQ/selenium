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


package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.testng.annotations.Test;

public class GoogleTest extends InternalSelenseTestBase {

  @Test(dataProvider = "system-properties")
  public void testGoogle() throws Throwable {
    selenium.open("http://www.google.com/webhp?hl=en");

    assertEquals(selenium.getTitle(), "Google");
    selenium.type("q", "Selenium OpenQA");
    assertEquals(selenium.getValue("q"), "Selenium OpenQA");
    selenium.click("btnG");
    selenium.waitForPageToLoad("5000");
    assertEquals(selenium.getTitle(), "Selenium OpenQA - Google Search");
  }

}
