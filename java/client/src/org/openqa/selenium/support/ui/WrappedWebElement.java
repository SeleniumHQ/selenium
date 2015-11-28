package org.openqa.selenium.support.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * To be used only when it is expected that the locator can find one and only one element.
 * <p/>
 * The first time that a method is called, the element is retrieved, and then the action is performed.
 * Any subsequent call will only perform the action on the element previously retrieved;
 * in case the action fails because the element is stale, another retrieval is performed, and the action is re-attempted.
 */
public class WrappedWebElement implements WebElement {

  private final By locator;
  private final WebElementRetriever retriever;
  private WebElement element;

  public WrappedWebElement(By locator, WebElementRetriever retriever) {
    this.locator = locator;
    this.retriever = retriever;
  }

  @Override
  public void click() {
    executeOperation(new WebElementOperation<Void>() {
      @Override
      public Void perform() {
        element.click();
        return null;
      }
    });
  }

  @Override
  public void submit() {
    executeOperation(new WebElementOperation<Void>() {
      @Override
      public Void perform() {
        element.submit();
        return null;
      }
    });
  }

  @Override
  public void sendKeys(final CharSequence... keysToSend) {
    executeOperation(new WebElementOperation<Void>() {
      @Override
      public Void perform() {
        element.sendKeys(keysToSend);
        return null;
      }
    });
  }

  @Override
  public void clear() {
    executeOperation(new WebElementOperation<Void>() {
      @Override
      public Void perform() {
        element.clear();
        return null;
      }
    });
  }

  @Override
  public String getTagName() {
    return executeOperation(new WebElementOperation<String>() {
      @Override
      public String perform() {
        return element.getTagName();
      }
    });
  }

  @Override
  public String getAttribute(final String name) {
    return executeOperation(new WebElementOperation<String>() {
      @Override
      public String perform() {
        return element.getAttribute(name);
      }
    });
  }

  @Override
  public boolean isSelected() {
    return executeOperation(new WebElementOperation<Boolean>() {
      @Override
      public Boolean perform() {
        return element.isSelected();
      }
    });
  }

  @Override
  public boolean isEnabled() {
    return executeOperation(new WebElementOperation<Boolean>() {
      @Override
      public Boolean perform() {
        return element.isEnabled();
      }
    });
  }

  @Override
  public String getText() {
    return executeOperation(new WebElementOperation<String>() {
      @Override
      public String perform() {
        return element.getText();
      }
    });
  }

  @Override
  public List<WebElement> findElements(final By by) {
    return executeOperation(new WebElementOperation<List<WebElement>>() {
      @Override
      public List<WebElement> perform() {
        return element.findElements(by);
      }
    });
  }

  @Override
  public WebElement findElement(final By by) {
    return executeOperation(new WebElementOperation<WebElement>() {
      @Override
      public WebElement perform() {
        return element.findElement(by);
      }
    });
  }

  @Override
  public boolean isDisplayed() {
    return executeOperation(new WebElementOperation<Boolean>() {
      @Override
      public Boolean perform() {
        return element.isDisplayed();
      }
    });
  }

  @Override
  public Point getLocation() {
    return executeOperation(new WebElementOperation<Point>() {
      @Override
      public Point perform() {
        return element.getLocation();
      }
    });
  }

  @Override
  public Dimension getSize() {
    return executeOperation(new WebElementOperation<Dimension>() {
      @Override
      public Dimension perform() {
        return element.getSize();
      }
    });
  }

  @Override
  public Rectangle getRect() {
    return executeOperation(new WebElementOperation<Rectangle>() {
      @Override
      public Rectangle perform() {
        return element.getRect();
      }
    });
  }

  @Override
  public String getCssValue(final String propertyName) {
    return executeOperation(new WebElementOperation<String>() {
      @Override
      public String perform() {
        return element.getCssValue(propertyName);
      }
    });
  }

  @Override
  public <X> X getScreenshotAs(final OutputType<X> target) throws WebDriverException {
    return executeOperation(new WebElementOperation<X>() {
      @Override
      public X perform() {
        return element.getScreenshotAs(target);
      }
    });
  }

  private <T> T executeOperation(WebElementOperation<T> operation) {
    if (!isFound()) {
      findElement();
      return operation.perform();
    } else {
      try {
        return operation.perform();
      } catch (StaleElementReferenceException e) {
        findElement();
        return operation.perform();
      }
    }
  }

  private void findElement() {
    element = retriever.findElement(locator);
  }

  private boolean isFound() {
    return element == null;
  }

  private interface WebElementOperation<T> {
    T perform();
  }
}
