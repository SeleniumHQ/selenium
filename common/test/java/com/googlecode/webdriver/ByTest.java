package com.googlecode.webdriver;

import com.googlecode.webdriver.internal.FindsById;
import com.googlecode.webdriver.internal.FindsByLinkText;
import com.googlecode.webdriver.internal.FindsByName;
import com.googlecode.webdriver.internal.FindsByXPath;
import org.jmock.Expectations;
import org.jmock.integration.junit3.MockObjectTestCase;

public class ByTest extends MockObjectTestCase {
  public void testShouldUseFindsByNameToLocateElementsByName() {
    final AllDriver driver = mock(AllDriver.class);

    checking(new Expectations() {{
      one(driver).findElementByName("cheese");
    }});

    By by = By.name("cheese");
    by.findElement(driver);
  }

  public void xtestShouldUseXPathToFindByNameIfDriverDoesNotImplementFindsByName() {
    final OnlyXPath driver = mock(OnlyXPath.class);

    checking(new Expectations() {{
      one(driver).findElementByXPath("//*[@name='cheese']");
		}});

    By by = By.name("cheese");

    by.findElement(driver);
  }

  public void testNothing() {
    // TODO: why does jmock choke on these tests?
  }

  private interface AllDriver extends FindsById, FindsByLinkText, FindsByName, FindsByXPath, SearchContext {
    // Place holder
  }

  private interface OnlyXPath extends FindsByXPath, SearchContext {
    // Place holder
  }
}
