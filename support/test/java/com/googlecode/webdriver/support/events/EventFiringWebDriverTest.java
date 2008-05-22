package com.googlecode.webdriver.support.events;

import com.googlecode.webdriver.By;
import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebDriver.Navigation;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.support.events.AbstractWebDriverEventListener;
import com.googlecode.webdriver.support.events.EventFiringWebDriver;
import org.jmock.Expectations;
import org.jmock.integration.junit3.MockObjectTestCase;

/**
 * @author Michael Tamm
 */
public class EventFiringWebDriverTest extends MockObjectTestCase {

    public void testNavigationEvents() {
        final WebDriver mockedDriver = mock(WebDriver.class);
        final Navigation mockedNavigation = mock(Navigation.class);
        final StringBuilder log = new StringBuilder();

        checking(new Expectations() {{
            one(mockedDriver).get("http://www.get.com");
            exactly(3).of(mockedDriver).navigate(); will(returnValue(mockedNavigation));
            one(mockedNavigation).to("http://www.navigate-to.com");
            one(mockedNavigation).back();
            one(mockedNavigation).forward();
        }});

        EventFiringWebDriver testedDriver = new EventFiringWebDriver(mockedDriver).register(new AbstractWebDriverEventListener() {
            public void beforeNavigateTo(String url, WebDriver driver) { log.append("beforeNavigateTo ").append(url).append("\n"); }
            public void afterNavigateTo(String url, WebDriver driver) { log.append("afterNavigateTo ").append(url).append("\n"); }
            public void beforeNavigateBack(WebDriver driver) { log.append("beforeNavigateBack\n"); }
            public void afterNavigateBack(WebDriver driver) { log.append("afterNavigateBack\n"); }
            public void beforeNavigateForward(WebDriver driver) { log.append("beforeNavigateForward\n"); }
            public void afterNavigateForward(WebDriver driver) { log.append("afterNavigateForward\n"); }
        });

        testedDriver.get("http://www.get.com");
        testedDriver.navigate().to("http://www.navigate-to.com");
        testedDriver.navigate().back();
        testedDriver.navigate().forward();

        assertEquals(
            "beforeNavigateTo http://www.get.com\n" +
            "afterNavigateTo http://www.get.com\n" +
            "beforeNavigateTo http://www.navigate-to.com\n" +
            "afterNavigateTo http://www.navigate-to.com\n" +
            "beforeNavigateBack\n" +
            "afterNavigateBack\n" +
            "beforeNavigateForward\n" +
            "afterNavigateForward\n",
            log.toString()
        );
    }

    public void testClickEvent() {
        final WebDriver mockedDriver = mock(WebDriver.class);
        final WebElement mockedElement = mock(WebElement.class);
        final StringBuilder log = new StringBuilder();

        checking(new Expectations() {{
            one(mockedDriver).findElement(By.name("foo")); will(returnValue(mockedElement));
            one(mockedElement).click();
        }});

        EventFiringWebDriver testedDriver = new EventFiringWebDriver(mockedDriver).register(new AbstractWebDriverEventListener() {
            public void beforeClickOn(WebElement element, WebDriver driver) { log.append("beforeClickOn\n"); }
            public void afterClickOn(WebElement element, WebDriver driver) { log.append("afterClickOn\n"); }
        });

        testedDriver.findElement(By.name("foo")).click();

        assertEquals(
            "beforeClickOn\n" +
            "afterClickOn\n",
            log.toString()
        );
    }

    public void testChangeValueEvent() {
        final WebDriver mockedDriver = mock(WebDriver.class);
        final WebElement mockedElement = mock(WebElement.class);
        final StringBuilder log = new StringBuilder();

        checking(new Expectations() {{
            exactly(3).of(mockedDriver).findElement(By.name("foo")); will(returnValue(mockedElement));
            one(mockedElement).clear();
            one(mockedElement).sendKeys("some text");
            one(mockedElement).toggle();
        }});

        EventFiringWebDriver testedDriver = new EventFiringWebDriver(mockedDriver).register(new AbstractWebDriverEventListener() {
            public void beforeChangeValueOf(WebElement element, WebDriver driver) { log.append("beforeChangeValueOf\n"); }
            public void afterChangeValueOf(WebElement element, WebDriver driver) { log.append("afterChangeValueOf\n"); }
        });

        testedDriver.findElement(By.name("foo")).clear();
        testedDriver.findElement(By.name("foo")).sendKeys("some text");
        testedDriver.findElement(By.name("foo")).toggle();

        assertEquals(
            "beforeChangeValueOf\n" +
            "afterChangeValueOf\n" +
            "beforeChangeValueOf\n" +
            "afterChangeValueOf\n" +
            "beforeChangeValueOf\n" +
            "afterChangeValueOf\n",
            log.toString()
        );
    }

    public void testFindByEvent() {
        final WebDriver mockedDriver = mock(WebDriver.class);
        final WebElement mockedElement = mock(WebElement.class);
        final StringBuilder log = new StringBuilder();

        checking(new Expectations() {{
            one(mockedDriver).findElement(By.id("foo")); will(returnValue(mockedElement));
            one(mockedElement).findElement(By.linkText("bar"));
            one(mockedElement).findElements(By.name("xyz"));
            one(mockedDriver).findElements(By.xpath("//link[@type = 'text/css']"));
        }});

        EventFiringWebDriver testedDriver = new EventFiringWebDriver(mockedDriver).register(new AbstractWebDriverEventListener() {
            public void beforeFindBy(By by, WebElement element, WebDriver driver) { log.append("beforeFindBy from ").append(element == null ? "WebDriver" : "WebElement").append(" ").append(by).append("\n"); }
            public void afterFindBy(By by, WebElement element, WebDriver driver) { log.append("afterFindBy from ").append(element == null ? "WebDriver" : "WebElement").append(" ").append(by).append("\n"); }
        });

        WebElement element = testedDriver.findElement(By.id("foo"));
        element.findElement(By.linkText("bar"));
        element.findElements(By.name("xyz"));
        testedDriver.findElements(By.xpath("//link[@type = 'text/css']"));

        assertEquals(
            "beforeFindBy from WebDriver By.id: foo\n" +
            "afterFindBy from WebDriver By.id: foo\n" +
            "beforeFindBy from WebElement By.linkText: bar\n" +
            "afterFindBy from WebElement By.linkText: bar\n" +
            "beforeFindBy from WebElement By.name: xyz\n" +
            "afterFindBy from WebElement By.name: xyz\n" +
            "beforeFindBy from WebDriver By.xpath: //link[@type = 'text/css']\n" +
            "afterFindBy from WebDriver By.xpath: //link[@type = 'text/css']\n",
            log.toString()
        );
    }
}
