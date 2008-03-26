package com.googlecode.webdriver.support;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Proxy;

import com.googlecode.webdriver.RenderedWebElement;
import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.support.internal.LocatingElementHandler;

/**
 * Factory class to make using Page Objects simpler and easier.
 *
 * @see http://code.google.com/p/webdriver/wiki/PageObjects
 */
public class PageFactory {

  /**
   * Instantiate an instance of the given class, and set a lazy proxy for each
   * of the WebElement fields that have been declared, assuming that the
   * field name is also the HTML element's "id" or "name". This means that for
   * the class:
   *
   * <code>
   * public class Page {
   *     private WebElement submit;
   * }
   * </code>
   *
   * there will be an element that can be located using the xpath expression
   * "//*[@id='submit']" or "//*[@name='submit']"
   *
   * By default, the element is looked up each and every time a method is called
   * upon it. To change this behaviour, simply annnotate the field with the
   * {@link @com.googlecode.webdriver.support.CacheLookup}. To change how the
   * element is located, use the {@link @com.googlecode.webdriver.support.FindBy}
   * annotation.
   *
   * This method will attempt to instantiate the class given to it, preferably
   * using a constructor which takes a WebDriver instance as its only argument
   * or falling back on a no-arg constructor. An exception will be thrown if
   * the class cannot be instantiated.
   *
   * @see @com.googlecode.webdriver.support.FindBy
   * @see @com.googlecode.webdriver.support.CacheLookup
   * @param driver The driver that will be used to look up the elements
   * @param pageClassToProxy A class which will be initialised.
   * @return An instantiated instance of the class with WebElement fields proxied
   */
    public static <T> T initElements(WebDriver driver, Class<T> pageClassToProxy) {
        T page = instantiatePage(driver, pageClassToProxy);
        initElements(driver, page);
        return page;
    }

  /**
   * As {@link com.googlecode.webdriver.support.PageFactory#initElements(com.googlecode.webdriver.WebDriver, Class)}
   * but will only replace the fields of an already instantiated Page Object.
   *
   * @param driver The driver that will be used to look up the elements
   * @param page The object with WebElement fields that should be proxied.
   */
    public static void initElements(WebDriver driver, Object page) {
        Class<?> proxyIn = page.getClass();
        while (proxyIn != Object.class) {
            proxyFields(driver, page, proxyIn);
            proxyIn = proxyIn.getSuperclass();
        }
    }

    private static void proxyFields(WebDriver driver, Object page, Class<?> proxyIn) {
        Field[] fields = proxyIn.getDeclaredFields();
        for (Field field : fields) {
            if (!WebElement.class.isAssignableFrom(field.getType()))
              continue;

            field.setAccessible(true);
            proxyElement(driver, page, field);
        }
    }

    private static void proxyElement(WebDriver driver, Object page, Field field) {
        InvocationHandler handler = new LocatingElementHandler(driver, field);
        WebElement proxy;
        if (field.getType().equals(RenderedWebElement.class)){
          proxy = (RenderedWebElement) Proxy.newProxyInstance(
              page.getClass().getClassLoader(), new Class[]{RenderedWebElement.class}, handler);
        } else {
          proxy = (WebElement) Proxy.newProxyInstance(
                  page.getClass().getClassLoader(), new Class[]{WebElement.class}, handler);
        }
        try {
            field.set(page, proxy);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    private static <T> T instantiatePage(WebDriver driver, Class<T> pageClassToProxy) {
        try {
            try {
                Constructor<T> constructor = pageClassToProxy.getConstructor(WebDriver.class);
                return constructor.newInstance(driver);
            } catch (NoSuchMethodException e) {
                return pageClassToProxy.newInstance();
            }
        } catch (InstantiationException e) {
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        } catch (InvocationTargetException e) {
            throw new RuntimeException(e);
        }
    }
}
