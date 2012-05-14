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

public class AttachFileTest extends InternalSelenseTestBase {

  @Test(dataProvider = "system-properties")
  public void testAttachfile() throws Throwable {
    selenium.open("http://www.snipshot.com");
    assertEquals("Snipshot: Edit pictures online", selenium.getTitle());

    selenium.attachFile("file", "http://www.google.com/intl/en_ALL/images/logo.gif");

    for (int second = 0;; second++) {
      if (second >= 60) fail("timeout");
      try {
        if (selenium.isElementPresent("save")) break;
      } catch (Exception e) {
      }
      Thread.sleep(1000);
    }
    assertTrue(selenium.isElementPresent("resize"));
    assertTrue(selenium.isElementPresent("crop"));


  }

}
