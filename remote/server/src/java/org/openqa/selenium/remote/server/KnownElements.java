package org.openqa.selenium.remote.server;

import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebElement;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;

public class KnownElements {

  private Map<String, WebElement> elements = new HashMap<String, WebElement>();
  private int nextId;

  public String add(WebElement element) {
    String id = getNextId();
    elements.put(id, proxyElement(element, id));
    return id;
  }

  public WebElement get(String elementId) {
    return elements.get(elementId);
  }

  // WebDriver is single threaded. Expect only a single thread at a time to access this
  private String getNextId() {
    return String.valueOf(nextId++);
  }

  private WebElement proxyElement(final WebElement element, final String id) {
    InvocationHandler handler = new InvocationHandler() {
      public Object invoke(Object object, Method method, Object[] objects) throws Throwable {
        if ("getId".equals(method.getName())) {
          return id;
        } else if ("getWrappedElement".equals(method.getName())) {
          return element;
        } else {
          return method.invoke(element, objects);
        }
      }
    };

    Class[] proxyThese;
    if (element instanceof RenderedWebElement) {
      proxyThese = new Class[]{RenderedWebElement.class, ProxiedElement.class};
    } else {
      proxyThese = new Class[]{WebElement.class, ProxiedElement.class};
    }

    return (WebElement) Proxy.newProxyInstance(element.getClass().getClassLoader(),
                                               proxyThese,
                                               handler);
  }

  public interface ProxiedElement {
    String getId();
    WebElement getWrappedElement();
  }
}
