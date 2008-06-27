package org.openqa.selenium.support.events;

import org.openqa.selenium.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.lang.reflect.Proxy;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * A wrapper around an arbitrary {@link WebDriver} instance
 * which supports registering of a {@link WebDriverEventListener},
 * e&#46;g&#46; for logging purposes.
 *
 * @author Michael Tamm
 */
public class EventFiringWebDriver implements WebDriver {

    private final WebDriver driver;
    private final List<WebDriverEventListener> eventListeners = new ArrayList<WebDriverEventListener>();
    private final WebDriverEventListener dispatcher = (WebDriverEventListener) Proxy.newProxyInstance(
        WebDriverEventListener.class.getClassLoader(),
        new Class[] { WebDriverEventListener.class },
        new InvocationHandler() {
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                for (WebDriverEventListener eventListener : eventListeners) {
                    method.invoke(eventListener, args);
                }
                return null;
            }
        }
    );

    public EventFiringWebDriver(WebDriver driver) {
        this.driver = driver;
    }

    /**
     * @return this for method chaining.
     */
    public EventFiringWebDriver register(WebDriverEventListener eventListener) {
        eventListeners.add(eventListener);
        return this;
    }

    /**
     * @return this for method chaining.
     */
    public EventFiringWebDriver unregister(WebDriverEventListener eventListener) {
        eventListeners.remove(eventListener);
        return this;
    }

    public void get(String url) {
        dispatcher.beforeNavigateTo(url, driver);
        driver.get(url);
        dispatcher.afterNavigateTo(url, driver);
    }

    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    public String getTitle() {
        return driver.getTitle();
    }

    public boolean getVisible() {
        return driver.getVisible();
    }

    public void setVisible(boolean visible) {
        driver.setVisible(visible);
    }

    public List<WebElement> findElements(By by) {
        dispatcher.beforeFindBy(by, null, driver);
        List<WebElement> temp = driver.findElements(by);
        dispatcher.afterFindBy(by, null, driver);
        List<WebElement> result = new ArrayList<WebElement>(temp.size());
        for (WebElement element : temp) {
            result.add(new EventFiringWebElement(element));
        }
        return result;
    }

    public WebElement findElement(By by) {
        dispatcher.beforeFindBy(by, null, driver);
        WebElement temp = driver.findElement(by);
        dispatcher.afterFindBy(by, null, driver);
        EventFiringWebElement result = new EventFiringWebElement(temp);
        return result;
    }

    public String getPageSource() {
        return driver.getPageSource();
    }

    public void close() {
        driver.close();
    }

    public void quit() {
        driver.quit();
    }

    public TargetLocator switchTo() {
        return new EventFiringTargetLocator(driver.switchTo());
    }

    public Navigation navigate() {
        return new EventFiringNavigation(driver.navigate());
    }

    public Options manage() {
        return new EventFiringOptions(driver.manage());
    }

    private class EventFiringWebElement implements WebElement {
        private final WebElement element;

        private EventFiringWebElement(WebElement element) {
            this.element = element;
        }

        public void click() {
            dispatcher.beforeClickOn(element, driver);
            element.click();
            dispatcher.afterClickOn(element, driver);
        }

        public void submit() {
            element.submit();
        }

        public String getValue() {
            return element.getValue();
        }

        public void sendKeys(CharSequence... keysToSend) {
            dispatcher.beforeChangeValueOf(element, driver);
            element.sendKeys(keysToSend);
            dispatcher.afterChangeValueOf(element, driver);
        }

        public void clear() {
            dispatcher.beforeChangeValueOf(element, driver);
            element.clear();
            dispatcher.afterChangeValueOf(element, driver);
        }

        public String getAttribute(String name) {
            return element.getAttribute(name);
        }

        public boolean toggle() {
            dispatcher.beforeChangeValueOf(element, driver);
            boolean result = element.toggle();
            dispatcher.afterChangeValueOf(element, driver);
            return result;
        }

        public boolean isSelected() {
            return element.isSelected();
        }

        public void setSelected() {
            element.setSelected();
        }

        public boolean isEnabled() {
            return element.isEnabled();
        }

        public String getText() {
            return element.getText();
        }

        public List<WebElement> getChildrenOfType(String tagName) {
            List<WebElement> elements = element.getChildrenOfType(tagName);
            List<WebElement> result = new ArrayList<WebElement>(elements.size());
            for (WebElement element : elements) {
                result.add(new EventFiringWebElement(element));
            }
            return result;
        }

        public WebElement findElement(By by) {
            dispatcher.beforeFindBy(by, element, driver);
            WebElement temp = element.findElement(by);
            dispatcher.afterFindBy(by, element, driver);
            return new EventFiringWebElement(temp);
        }

        public List<WebElement> findElements(By by) {
            dispatcher.beforeFindBy(by, element, driver);
            List<WebElement> temp = element.findElements(by);
            dispatcher.afterFindBy(by, element, driver);
            List<WebElement> result = new ArrayList<WebElement>(temp.size());
            for (WebElement element : temp) {
                result.add(new EventFiringWebElement(element));
            }
            return result;
        }
    }

    private class EventFiringNavigation implements Navigation {
        private final WebDriver.Navigation navigation;

        EventFiringNavigation(Navigation navigation) {
            this.navigation = navigation;
        }

        public void to(String url) {
            dispatcher.beforeNavigateTo(url, driver);
            navigation.to(url);
            dispatcher.afterNavigateTo(url, driver);
        }

        public void back() {
            dispatcher.beforeNavigateBack(driver);
            navigation.back();
            dispatcher.afterNavigateBack(driver);
        }

        public void forward() {
            dispatcher.beforeNavigateForward(driver);
            navigation.forward();
            dispatcher.afterNavigateForward(driver);
        }
    }

    private class EventFiringOptions implements Options {
        private Options options;

        private EventFiringOptions(Options options) {
            this.options = options;
        }

        public void addCookie(Cookie cookie) {
            options.addCookie(cookie);
        }

        public void deleteCookieNamed(String name) {
            options.deleteCookieNamed(name);
        }

        public void deleteCookie(Cookie cookie) {
            options.deleteCookie(cookie);
        }

        public void deleteAllCookies() {
            options.deleteAllCookies();
        }

        public Set<Cookie> getCookies() {
            return options.getCookies();
        }

        public Speed getSpeed() {
            return options.getSpeed();
        }

        public void setSpeed(Speed speed) {
            options.setSpeed(speed);
        }
    }

    private class EventFiringTargetLocator implements TargetLocator {
        private TargetLocator targetLocator;

        private EventFiringTargetLocator(TargetLocator targetLocator) {
            this.targetLocator = targetLocator;
        }

        public WebDriver frame(int frameIndex) {
            return targetLocator.frame(frameIndex);
        }

        public WebDriver frame(String frameName) {
            return targetLocator.frame(frameName);
        }

        public WebDriver window(String windowName) {
            return targetLocator.window(windowName);
        }

        public WebDriver defaultContent() {
            return targetLocator.defaultContent();
        }
    }

}
