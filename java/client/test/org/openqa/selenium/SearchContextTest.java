package org.openqa.selenium;

import java.util.List;

// this class just tests we can compile the code
public class SearchContextTest {

  private interface TestWebElement extends WebElement {

  }

  private interface SubClassingSearchContext extends SearchContext {

    @Override
    List<TestWebElement> findElements(By by);

    @Override
    TestWebElement findElement(By by);
  }

  private interface SameClassSearchContext extends SearchContext {

    @Override
    List<WebElement> findElements(By by);

    @Override
    WebElement findElement(By by);
  }
}
