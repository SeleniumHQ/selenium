package com.thoughtworks.webdriver.support.internal;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.How;
import com.thoughtworks.webdriver.support.FindBy;
import com.thoughtworks.webdriver.support.CacheLookup;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Field;

public class LocatingElementHandler implements InvocationHandler {
    private final WebDriver driver;
    private final String locator;
    private final boolean cacheLookup;
    private WebElement element;

    public LocatingElementHandler(WebDriver driver, Field field) {
        this.driver = driver;
        this.locator = buildLocator(field);
        this.cacheLookup = isLookupCached(field);
    }

    private boolean isLookupCached(Field field) {
        return field.getAnnotation(CacheLookup.class) == null ? false : true;
    }

  private String buildLocator(Field field) {
      How how = How.ID;
      String using = field.getName();

      FindBy findBy = field.getAnnotation(FindBy.class);
      if (findBy != null) {
          how = findBy.how();
          using = findBy.using();
      }

      switch(how) {
        case ID:
          return "id=" + using;

        case LINK_TEXT:
          return "link=" + using;

        case XPATH:
          return using;

        default:
          throw new IllegalArgumentException("Cannot determine how to locate element");
      }
    }

    public Object invoke(Object object, Method method, Object[] objects) throws Throwable {
        if (cacheLookup) {
            if (element == null)
                element = driver.selectElement(locator);
            return method.invoke(element, objects);
        }

        WebElement use = driver.selectElement(locator);
        return method.invoke(use, objects);
    }
}
