/*
Copyright 2007-2009 Selenium committers

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


package org.openqa.selenium.lift.find;

import org.jmock.Expectations;
import org.jmock.integration.junit4.JUnitRuleMockery;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import java.util.Collections;

public class XPathFinderTest {

  @Rule public JUnitRuleMockery mockery = new JUnitRuleMockery();

  @Test
  public void shouldReturnManyElements() {
    final String xpath = "//body";

    XPathFinder finder = new XPathFinder(xpath);

    final WebDriver driver = mockery.mock(WebDriver.class);
    mockery.checking(new Expectations() {
      {
        oneOf(driver).findElements(By.xpath(xpath));
        will(returnValue(Collections.EMPTY_LIST));
      }
    });


    finder.extractFrom(driver);
  }
}
