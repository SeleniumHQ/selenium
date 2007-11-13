package com.thoughtworks.webdriver.support;

import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.support.internal.LocatingElementHandler;

import java.lang.reflect.Field;
import java.lang.reflect.Proxy;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

public class PageFactory {
    public static <T> T proxyElements(WebDriver driver, Class<T> pageClassToProxy) {
        T page = instantiatePage(driver, pageClassToProxy);
        proxyElements(driver, page);
        return page;
    }

    public static void proxyElements(WebDriver driver, Object page) {
        Class proxyIn = page.getClass();
        while (proxyIn != Object.class) {
            proxyFields(driver, page, proxyIn);
            proxyIn = proxyIn.getSuperclass();
        }
    }

    private static void proxyFields(WebDriver driver, Object page, Class proxyIn) {
        Field[] fields = proxyIn.getDeclaredFields();
        for (Field field : fields) {
            field.setAccessible(true);
            if (!WebElement.class.equals(field.getType()))
                continue;

            proxyElement(driver, page, field);
        }
    }

    private static void proxyElement(WebDriver driver, Object page, Field field) {
        InvocationHandler handler = new LocatingElementHandler(driver, field);

        WebElement proxy = (WebElement) Proxy.newProxyInstance(
                page.getClass().getClassLoader(), new Class[]{WebElement.class}, handler);
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
