package org.openqa.selenium;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.net.URL;
import java.net.URLClassLoader;
import java.util.List;
import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.support.locators.LocatorStrategy;
import org.openqa.selenium.support.locators.ServiceLocatorFactory;

public class ByCustomLocatorTest {

  @Test
  public void loadPluginUsingSpi(){
    //Assume structure is fakeInf/META-INF/services/org.openqa.selenium.support.locators.LocatorStrategy
    
    URL url = getClass().getClassLoader().getResource("fakeInf/");
    ClassLoader loader = new URLClassLoader(new URL[]{url}, Thread.currentThread().getContextClassLoader());


    ServiceLocatorFactory.loadWithClassLoader(loader);
    Assert.assertEquals(ServiceLocatorFactory.getLocatorPlugIns().size(), 1);
  }

  @Test
  public void findElementsUsingCustomTest() {
    AllDriver driver = mock(AllDriver.class);

    FakeLocator.useId("foo").findElements(driver);
    verify(driver).findElements(FakeLocator.useId("foo"));
  }

  private interface AllDriver extends SearchContext {
    // Place holder
  }

  public static class FakeLocator implements LocatorStrategy {

    public static By useId(Object value) {
      return new FakeLocatorBy(value);
    }

    @Override
    public boolean handles(String using) {
      return false;
    }

    public static class FakeLocatorBy extends By {

      public FakeLocatorBy(Object locator) {
        Require.nonNull("Locator cannot be null", locator);
      }

      @Override
      public List<WebElement> findElements(SearchContext context) {
        return context.findElements(this);
      }
    }
  }
}
