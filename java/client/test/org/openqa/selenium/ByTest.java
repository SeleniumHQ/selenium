/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium;

import org.jmock.Expectations;
import org.junit.Test;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

public class ByTest extends MockTestBase {

  @Test
  public void shouldUseFindsByNameToLocateElementByName() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {
      {
        one(driver).findElementByName("cheese");
      }
    });

    By by = By.name("cheese");
    by.findElement(driver);
  }

  @Test
  public void shouldUseFindsByNameToLocateElementsByName() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {
      {
        one(driver).findElementsByName("cheese");
      }
    });

    By by = By.name("cheese");
    by.findElements(driver);
  }

  @Test
  public void shouldMakeXPathForAttributeMatchWithValue() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {{
      one(driver).findElementByXPath(".//*[@foo = 'bar']");
    }});

    By by = By.attribute("foo", "bar");

    by.findElement(driver);
  }

  @Test
  public void shouldMakeXPathForAttributeMatchWithValueForMultipleElements() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {{
      one(driver).findElementsByXPath(".//*[@foo = 'bar']");
    }});

    By by = By.attribute("foo", "bar");

    by.findElements(driver);
  }

  @Test
  public void shouldMakeXPathForAttributeMatch() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {{
      one(driver).findElementByXPath(".//*[@foo]");
    }});

    By by = By.attribute("foo");

    by.findElement(driver);
  }

  @Test
  public void shouldMakeXPathForAttributeMatchForMultipleElements() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {{
      one(driver).findElementsByXPath(".//*[@foo]");
    }});

    By by = By.attribute("foo");

    by.findElements(driver);
  }

  @Test
  public void shouldMakeXpathFromCompositeOfTagNameAndClassName() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {{
      one(driver).findElementByXPath(".//foo[contains(concat(' ',normalize-space(@class),' '),' bar ')]");
    }});

    By by = By.composite(By.tagName("foo"), By.className("bar"));

    by.findElement(driver);
  }

  @Test
  public void shouldMakeXpathFromCompositeOfTagNameAndClassNameForMultipleElements() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {{
      one(driver).findElementsByXPath(".//foo[contains(concat(' ',normalize-space(@class),' '),' bar ')]");
    }});

    By by = By.composite(By.tagName("foo"), By.className("bar"));

    by.findElements(driver);
  }

  @Test
  public void shouldMakeXpathFromCompositeOfTagNameAndAttribute() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {{
      one(driver).findElementByXPath(".//foo[@bar = 'baz']");
    }});

    By by = By.composite(By.tagName("foo"), By.attribute("bar", "baz"));

    by.findElement(driver);
  }

  @Test
  public void shouldMakeXpathFromCompositeOfTagNameAndAttributeForMultipleElements() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {{
      one(driver).findElementsByXPath(".//foo[@bar]");
    }});

    By by = By.composite(By.tagName("foo"), By.attribute("bar"));

    by.findElements(driver);
  }

  @Test
  public void shouldBarfIfNotCompositeOfTagNameAndClassName() {

    try {
      By.composite(null);
    } catch (IllegalArgumentException e) {
      assertThat(e.getMessage(),
              is("Cannot make composite with no varargs of Bys"));
    }

    try {
      By.composite(new By[0]);
    } catch (IllegalArgumentException e) {
      assertThat(e.getMessage(),
              is("can only do this with By.tagName followed one of By.className or By.attribute"));
    }

    try {
      By.composite(By.tagName("foo"), By.xpath("bar"));
    } catch (IllegalArgumentException e) {
      assertThat(e.getMessage(),
              is("can only do this with By.tagName followed one of By.className or By.attribute"));
    }

    try {
      By.composite(By.tagName("foo"), By.className("bar"), By.className("baz"));
    } catch (IllegalArgumentException e) {
      assertThat(e.getMessage(),
              is("can only do this with By.tagName followed one of By.className or By.attribute"));
    }

    try {
      By.composite(By.tagName("foo"));
    } catch (IllegalArgumentException e) {
      assertThat(e.getMessage(),
              is("can only do this with By.tagName followed one of By.className or By.attribute"));
    }
  }

  @Test
  @org.junit.Ignore
  public void xtestShouldUseXPathToFindByNameIfDriverDoesNotImplementFindsByName() {
    final OnlyXPath driver = mock(OnlyXPath.class);

    checking(new Expectations() {
      {
        one(driver).findElementByXPath("//*[@name='cheese']");
      }
    });

    By by = By.name("cheese");

    by.findElement(driver);
  }

  private interface AllDriver
      extends FindsById, FindsByLinkText, FindsByName, FindsByXPath, SearchContext {
    // Place holder
  }

  private interface OnlyXPath extends FindsByXPath, SearchContext {

  }
}
