package org.openqa.selenium;

import java.util.List;

// this class just tests we can compile the code
public class SearchContextTest {

  private interface TestWebElement extends WebElement {

  }

  private interface TestSearchContext extends SearchContext {

    @Override
    List<TestWebElement> findElements(By by);

    @Override
    TestWebElement findElement(By by);
  }
}
