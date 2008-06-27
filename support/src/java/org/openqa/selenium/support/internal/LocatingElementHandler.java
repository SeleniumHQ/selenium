package org.openqa.selenium.support.internal;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

import org.openqa.selenium.By;
import org.openqa.selenium.How;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;

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
        return (field.getAnnotation(CacheLookup.class) != null);
    }

  private By buildBy(Field field) {
      How how = How.ID_OR_NAME;
      String using = field.getName();

      FindBy findBy = field.getAnnotation(FindBy.class);
      if (findBy != null) {
          how = findBy.how();
          using = findBy.using();
      }

      switch(how) {
        case ID:
          return By.id(using);

        case ID_OR_NAME:
          return new ByIdOrName(using);

        case LINK_TEXT:
          return By.linkText(using);

        case NAME:
          return By.name(using);

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
