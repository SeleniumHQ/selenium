package com.googlecode.webdriver.support.internal;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

import com.googlecode.webdriver.By;
import com.googlecode.webdriver.How;
import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.support.CacheLookup;
import com.googlecode.webdriver.support.FindBy;

public class LocatingElementHandler implements InvocationHandler {
    private final WebDriver driver;
    private final By by;
    private final boolean cacheLookup;
    private WebElement element;

    public LocatingElementHandler(WebDriver driver, Field field) {
        this.driver = driver;
        this.by = buildBy(field);
        this.cacheLookup = isLookupCached(field);
    }

    private boolean isLookupCached(Field field) {
        return field.getAnnotation(CacheLookup.class) == null ? false : true;
    }

  private By buildBy(Field field) {
      How how = How.ID;
      String using = field.getName();

      FindBy findBy = field.getAnnotation(FindBy.class);
      if (findBy != null) {
          how = findBy.how();
          using = findBy.using();
      }

      switch(how) {
        case ID:
          return By.id(using);

        case LINK_TEXT:
          return By.linkText(using);

        case XPATH:
          return By.xpath(using);

        default:
          throw new IllegalArgumentException("Cannot determine how to locate element");
      }
    }

    public Object invoke(Object object, Method method, Object[] objects) throws Throwable {
        if (cacheLookup) {
            if (element == null)
                element = driver.findElement(by);
            return method.invoke(element, objects);
        }

        WebElement use = driver.findElement(by);
        return method.invoke(use, objects);
    }
}
