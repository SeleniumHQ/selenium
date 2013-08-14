/*
Copyright 2007-2013 Selenium committers

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

package org.openqa.selenium.support.pagefactory;

import org.jmock.Expectations;
import org.jmock.integration.junit4.JUnitRuleMockery;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

public class ByAllTest {

  @Rule public JUnitRuleMockery mockery = new JUnitRuleMockery();
  
  @Test
  public void findElementZeroBy() {
    final AllDriver driver = mockery.mock(AllDriver.class);

    ByAll by = new ByAll();
    try {
      by.findElement(driver);
      fail("Expected NoSuchElementException!");
    } catch (NoSuchElementException e) {
      // Expected
    }
  }

  @Test
  public void findElementsZeroBy() {
    final AllDriver driver = mockery.mock(AllDriver.class);

    ByAll by = new ByAll();
    assertThat(by.findElements(driver),
        equalTo((List<WebElement>) new ArrayList<WebElement>()));
  }

  @Test
  public void findElementOneBy() {
    final AllDriver driver = mockery.mock(AllDriver.class);
    final WebElement elem1 = mockery.mock(WebElement.class, "webElement1");
    final WebElement elem2 = mockery.mock(WebElement.class, "webElement2");
    final List<WebElement> elems12 = new ArrayList<WebElement>();
    elems12.add(elem1);
    elems12.add(elem2);

    mockery.checking(new Expectations() {{
      oneOf(driver).findElementsByName("cheese");
      will(returnValue(elems12));
    }});

    ByAll by = new ByAll(By.name("cheese"));
    assertThat(by.findElement(driver), equalTo(elem1));
  }

  @Test
  public void findElementsOneBy() {
    final AllDriver driver = mockery.mock(AllDriver.class);
    final WebElement elem1 = mockery.mock(WebElement.class, "webElement1");
    final WebElement elem2 = mockery.mock(WebElement.class, "webElement2");
    final List<WebElement> elems12 = new ArrayList<WebElement>();
    elems12.add(elem1);
    elems12.add(elem2);

    mockery.checking(new Expectations() {{
      oneOf(driver).findElementsByName("cheese");
      will(returnValue(elems12));
    }});

    ByAll by = new ByAll(By.name("cheese"));
    assertThat(by.findElements(driver), equalTo(elems12));
  }

  @Test
  public void findElementOneByEmpty() {
    final AllDriver driver = mockery.mock(AllDriver.class);
    final List<WebElement> elems = new ArrayList<WebElement>();

    mockery.checking(new Expectations() {{
      oneOf(driver).findElementsByName("cheese");
      will(returnValue(elems));
    }});

    ByAll by = new ByAll(By.name("cheese"));
    try {
      by.findElement(driver);
      fail("Expected NoSuchElementException!");
    } catch (NoSuchElementException e) {
      // Expected
    }
  }

  @Test
  public void findElementsOneByEmpty() {
    final AllDriver driver = mockery.mock(AllDriver.class);
    final List<WebElement> elems = new ArrayList<WebElement>();

    mockery.checking(new Expectations() {{
      oneOf(driver).findElementsByName("cheese");
      will(returnValue(elems));
    }});

    ByAll by = new ByAll(By.name("cheese"));
    assertThat(by.findElements(driver), equalTo(elems));
  }

  @Test
  public void findFourElementBy() {
    final AllDriver driver = mockery.mock(AllDriver.class);
    final WebElement elem1 = mockery.mock(AllElement.class, "webElement1");
    final WebElement elem2 = mockery.mock(AllElement.class, "webElement2");
    final WebElement elem3 = mockery.mock(AllElement.class, "webElement3");
    final WebElement elem4 = mockery.mock(AllElement.class, "webElement4");
    final List<WebElement> elems12 = new ArrayList<WebElement>();
    elems12.add(elem1);
    elems12.add(elem2);
    final List<WebElement> elems34 = new ArrayList<WebElement>();
    elems34.add(elem3);
    elems34.add(elem4);

    mockery.checking(new Expectations() {{
      oneOf(driver).findElementsByName("cheese");
      will(returnValue(elems12));
      oneOf(driver).findElementsByName("photo");
      will(returnValue(elems34));
    }});

    ByAll by = new ByAll(By.name("cheese"), By.name("photo"));
    assertThat(by.findElement(driver), equalTo(elem1));
  }

  @Test
  public void findFourElementsByAny() {
    final AllDriver driver = mockery.mock(AllDriver.class);
    final WebElement elem1 = mockery.mock(AllElement.class, "webElement1");
    final WebElement elem2 = mockery.mock(AllElement.class, "webElement2");
    final WebElement elem3 = mockery.mock(AllElement.class, "webElement3");
    final WebElement elem4 = mockery.mock(AllElement.class, "webElement4");
    final List<WebElement> elems12 = new ArrayList<WebElement>();
    elems12.add(elem1);
    elems12.add(elem2);
    final List<WebElement> elems34 = new ArrayList<WebElement>();
    elems34.add(elem3);
    elems34.add(elem4);
    final List<WebElement> elems1234 = new ArrayList<WebElement>();
    elems1234.addAll(elems12);
    elems1234.addAll(elems34);

    mockery.checking(new Expectations() {{
      oneOf(driver).findElementsByName("cheese");
      will(returnValue(elems12));
      oneOf(driver).findElementsByName("photo");
      will(returnValue(elems34));
    }});

    ByAll by = new ByAll(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), equalTo(elems1234));
  }

  @Test
  public void testEquals() {
    assertThat(new ByAll(By.id("cheese"), By.name("photo")),
        equalTo(new ByAll(By.id("cheese"), By.name("photo"))));
  }

  private interface AllDriver extends
      FindsById, FindsByLinkText, FindsByName, FindsByXPath, SearchContext {
    // Place holder
  }

  private interface AllElement extends WebElement {
    // Place holder
  }
}
