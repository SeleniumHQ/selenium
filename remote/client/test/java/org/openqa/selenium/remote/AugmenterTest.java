/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.remote;

import java.lang.reflect.Method;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.browserlaunchers.CapabilityType;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

public class AugmenterTest {
  @Test
  public void shouldReturnANormalWebDriverUntouched() {
    WebDriver driver = new StubDriver();

    WebDriver returned = new Augmenter().augment(driver);

    assertSame(driver, returned);
  }

  @Test
  public void shouldLeaveARemoteWebDriverWhichCannotTakeSnapshotsAlone() throws Exception {
    DesiredCapabilities caps = new DesiredCapabilities();
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = new Augmenter().augment(driver);

    assertSame(driver, returned);
    assertFalse(returned instanceof TakesScreenshot);
  }

  @Test
  public void shouldAddTheTakesSnapshotInterfaceIfNecessary() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.TAKES_SCREENSHOT, true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = new Augmenter().augment(driver);

    assertNotSame(driver, returned);
    assertTrue(returned instanceof TakesScreenshot);
  }
  
  @Test
  public void shouldNotAddTheTakesSnapshotInterfaceWhenBooleanValueIsFalse() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.TAKES_SCREENSHOT, false);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = new Augmenter().augment(driver);

    assertSame(driver, returned);
    assertFalse(returned instanceof TakesScreenshot);
  }

  @Test
  public void shouldDelegateToHandlerIfAdded() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability("foo", true);

    Augmenter augmenter = new Augmenter();
    augmenter.addAugmentation("foo", new AugmenterProvider() {
      public Class<?> getDescribedInterface() {
        return MyInterface.class;
      }

      public InterfaceImplementation getImplementation(Object value) {
        return new InterfaceImplementation() {
          public Object invoke(ExecuteMethod executeMethod, Method method, Object... args) {
            return "Hello World";
          }
        };
      }
    });

    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);
    WebDriver returned = augmenter.augment(driver);

    String text = ((MyInterface) returned).getHelloWorld();
    assertEquals("Hello World", text);
  }

  @Test
  public void shouldDelegateUnmatchedMethodCallsToDriverImplementation() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.TAKES_SCREENSHOT, true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = new Augmenter().augment(driver);

    assertEquals("Title", returned.getTitle());
  }

  @Test(expected = NoSuchElementException.class)
  public void proxyShouldNotAppearInStackTraces() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.TAKES_SCREENSHOT, true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = new Augmenter().augment(driver);

    returned.findElement(By.id("ignored"));
  }

  private static class StubExecutor implements CommandExecutor {
    private final Capabilities capabilities;

    private StubExecutor(Capabilities capabilities) {
      this.capabilities = capabilities;
    }

    public Response execute(Command command) throws Exception {
      if (DriverCommand.NEW_SESSION == command.getName()) {
        Response response = new Response(new SessionId("foo"));
        response.setStatus(ErrorCodes.SUCCESS);
        response.setValue(capabilities.asMap());
        return response;
      }

      if (DriverCommand.FIND_ELEMENT == command.getName()) {
        Response response = new Response(new SessionId("foo"));
        response.setStatus(ErrorCodes.NO_SUCH_ELEMENT);
        return response;
      }

      if (DriverCommand.GET_TITLE == command.getName()) {
        Response response = new Response(new SessionId("foo"));
        response.setStatus(ErrorCodes.SUCCESS);
        response.setValue("Title");
        return response;
      }

      return null;
    }
  }

  public interface MyInterface {
    String getHelloWorld();
  }
}
