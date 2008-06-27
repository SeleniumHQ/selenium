package org.openqa.selenium;

import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;
import org.jmock.Expectations;
import org.jmock.integration.junit3.MockObjectTestCase;

public class ByTest extends MockObjectTestCase {
  public void testShouldUseFindsByNameToLocateElementsByName() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {{
      one(driver).findElementByName("cheese");
    }});

    By by = By.name("cheese");
    by.findElement((SearchContext) driver);
  }

  public void xtestShouldUseXPathToFindByNameIfDriverDoesNotImplementFindsByName() {
    final OnlyXPath driver = mock(OnlyXPath.class);

    checking(new Expectations() {{
      one(driver).findElementByXPath("//*[@name='cheese']");
		}});

    By by = By.name("cheese");

    by.findElement((SearchContext) driver);
  }

  private interface AllDriver extends FindsById, FindsByLinkText, FindsByName, FindsByXPath, SearchContext {
    // Place holder
  }

  private interface OnlyXPath extends FindsByXPath, SearchContext {
  }
}
