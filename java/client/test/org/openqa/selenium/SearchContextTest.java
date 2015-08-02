package org.openqa.selenium;

import org.junit.Test;

import java.util.List;

// this class just tests we can compile the code
public class SearchContextTest {

  private final SubClassingSearchContext subClassingSearchContext = new SubClassingSearchContext();
  private final SameClassSearchContext sameClassSearchContext = new SameClassSearchContext() {
    @Override
    public List<WebElement> findElements(By by) {
      return null;
    }

    @Override
    public WebElement findElement(By by) {
      return null;
    }
  };

  private interface TestWebElement extends WebElement {

  }

  private static class SubClassingSearchContext implements SearchContext {

    @Override
    public List<TestWebElement> findElements(By by) {
      return null;
    }

    @Override
    public TestWebElement findElement(By by) {
      return null;
    }
  }

  private interface SameClassSearchContext extends SearchContext {

  }

  @Test
  public void makeSureFindElementsIsBackwardsCompatible() throws Exception {

    @SuppressWarnings("unused")
    List<? extends WebElement> elements = sameClassSearchContext.findElements(null);
  }

  @Test
  public void makeSureFindElementIsBackwardsCompatible() throws Exception {

    @SuppressWarnings("unused")
    WebElement element = sameClassSearchContext.findElement(null);
  }

  @Test
  public void makeSureFindElementsCanUseSuperClass() throws Exception {
    @SuppressWarnings("unused")
    List<TestWebElement> elements = subClassingSearchContext.findElements(null);
  }

  @Test
  public void makeSureFindElementCanUseSuperClass() throws Exception {

    @SuppressWarnings("unused")
    WebElement element = subClassingSearchContext.findElement(null);


  }
}
