// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote;

import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENT;

import com.google.common.collect.ImmutableMap;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class BaseAugmenterTest {

  @Test
  public void shouldReturnANormalWebDriverUntouched() {
    WebDriver driver = mock(WebDriver.class);

    WebDriver returned = getAugmenter().augment(driver);

    assertThat(returned).isSameAs(driver);
  }

  @Test
  public void shouldAddInterfaceFromCapabilityIfNecessary() {
    final Capabilities caps = new ImmutableCapabilities("magic.numbers", true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    BaseAugmenter augmenter = getAugmenter();
    augmenter.addDriverAugmentation("magic.numbers", new AddsMagicNumberHolder());
    WebDriver returned = augmenter.augment(driver);

    assertThat(returned).isNotSameAs(driver);
    assertThat(returned).isInstanceOf(TakesScreenshot.class);
  }

  @Test
  public void shouldNotAddInterfaceWhenBooleanValueForItIsFalse() {
    Capabilities caps = new ImmutableCapabilities("magic.numbers", false);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    BaseAugmenter augmenter = getAugmenter();
    augmenter.addDriverAugmentation("magic.numbers", new AddsMagicNumberHolder());
    WebDriver returned = augmenter.augment(driver);

    assertThat(returned).isSameAs(driver);
    assertThat(returned).isNotInstanceOf(MagicNumberHolder.class);
  }

  @Test
  public void shouldDelegateToHandlerIfAdded() {
    Capabilities caps = new ImmutableCapabilities("foo", true);

    BaseAugmenter augmenter = getAugmenter();
    augmenter.addDriverAugmentation("foo", new AugmenterProvider() {
      @Override
      public Class<?> getDescribedInterface() {
        return MyInterface.class;
      }

      @Override
      public InterfaceImplementation getImplementation(Object value) {
        return (executeMethod, self, method, args) -> "Hello World";
      }
    });

    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);
    WebDriver returned = augmenter.augment(driver);

    String text = ((MyInterface) returned).getHelloWorld();
    assertThat(text).isEqualTo("Hello World");
  }

  @Test
  public void shouldDelegateUnmatchedMethodCallsToDriverImplementation() {
    Capabilities caps = new ImmutableCapabilities("magic.numbers", true);
    StubExecutor stubExecutor = new StubExecutor(caps);
    stubExecutor.expect(DriverCommand.GET_TITLE, new HashMap<>(), "Title");
    WebDriver driver = new RemoteWebDriver(stubExecutor, caps);

    BaseAugmenter augmenter = getAugmenter();
    augmenter.addDriverAugmentation("magic.numbers", new AddsMagicNumberHolder());
    WebDriver returned = augmenter.augment(driver);

    assertThat(returned.getTitle()).isEqualTo("Title");
  }

  @Test
  public void proxyShouldNotAppearInStackTraces() {
    // This will force the class to be enhanced
    final Capabilities caps = new ImmutableCapabilities("magic.numbers", true);

    DetonatingDriver driver = new DetonatingDriver();
    driver.setCapabilities(caps);

    BaseAugmenter augmenter = getAugmenter();
    augmenter.addDriverAugmentation("magic.numbers", new AddsMagicNumberHolder());
    WebDriver returned = augmenter.augment(driver);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> returned.findElement(By.id("ignored")));
  }


  @Test
  public void shouldLeaveAnUnAugmentableElementAlone() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("1234");

    WebElement returned = getAugmenter().augment(element);

    assertThat(returned).isSameAs(element);
  }

  @Test
  public void shouldAllowAnElementToBeAugmented() {
    RemoteWebElement element = new RemoteWebElement();
    element.setId("1234");

    BaseAugmenter augmenter = getAugmenter();
    augmenter.addElementAugmentation("foo", new AugmenterProvider() {
      @Override
      public Class<?> getDescribedInterface() {
        return MyInterface.class;
      }

      @Override
      public InterfaceImplementation getImplementation(Object value) {
        return (executeMethod, self, method, args) -> "Hello World";
      }
    });

    final Capabilities caps = new ImmutableCapabilities("foo", true);

    StubExecutor executor = new StubExecutor(caps);
    RemoteWebDriver parent = new RemoteWebDriver(executor, caps) {
      @Override
      public Capabilities getCapabilities() {
        return caps;
      }
    };
    element.setParent(parent);

    WebElement returned = augmenter.augment(element);

    assertThat(returned).isInstanceOf(MyInterface.class);

    executor.expect(DriverCommand.CLICK_ELEMENT, singletonMap("id", "1234"), null);
    returned.click();
  }

  @Test
  public void shouldCopyFieldsFromTemplateInstanceIntoChildInstance() {
    ChildRemoteDriver driver = new ChildRemoteDriver();
    driver.setMagicNumber(3);
    MagicNumberHolder holder = (MagicNumberHolder) getAugmenter().augment(driver);

    assertThat(holder.getMagicNumber()).isEqualTo(3);
  }

  @Test
  public void shouldNotChokeOnFinalFields() {
    WithFinals withFinals = new WithFinals();
    getAugmenter().augment(withFinals);
  }

  @Test
  @Ignore("Reflexive calls are currently broken in every implementation")
  public void shouldAllowReflexiveCalls() {
    Capabilities caps = new ImmutableCapabilities("find by magic", true);
    StubExecutor executor = new StubExecutor(caps);
    final WebElement element = mock(WebElement.class);
    executor.expect(
      FIND_ELEMENT,
      ImmutableMap.of("using", "magic", "value", "cheese"),
      element);

    WebDriver driver = new RemoteWebDriver(executor, caps);
    BaseAugmenter augmenter = getAugmenter();

    augmenter.addDriverAugmentation("find by magic", new AugmenterProvider() {
      @Override
      public Class<?> getDescribedInterface() {
        return FindByMagic.class;
      }

      @Override
      public InterfaceImplementation getImplementation(Object value) {
        return (executeMethod, self, method, args) -> element;
      }
    });
    WebDriver returned = augmenter.augment(driver);

    returned.findElement(new ByMagic("cheese"));
    // No exception is a Good Thing
  }

  private static class ByMagic extends By {
    private final String magicWord;

    public ByMagic(String magicWord) {
      this.magicWord = magicWord;
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      return List.of(((FindByMagic) context).findByMagic(magicWord));
    }
  }

  public interface FindByMagic {
    WebElement findByMagic(String magicWord);
  }

  @Test
  public void shouldBeAbleToAugmentMultipleTimes() {
    Capabilities caps = new ImmutableCapabilities("canRotate", true, "magic.numbers", true);

    StubExecutor stubExecutor = new StubExecutor(caps);
    stubExecutor.expect(DriverCommand.GET_SCREEN_ORIENTATION,
                        Collections.emptyMap(),
                        ScreenOrientation.PORTRAIT.name());
    RemoteWebDriver driver = new RemoteWebDriver(stubExecutor, caps);

    BaseAugmenter augmenter = getAugmenter();
    augmenter.addDriverAugmentation("canRotate", new AddRotatable());

    WebDriver augmented = augmenter.augment(driver);
    assertThat(driver).isNotSameAs(augmented);
    assertThat(augmented).isInstanceOf(Rotatable.class);
    assertThat(augmented).isNotInstanceOf(MagicNumberHolder.class);

    augmenter = getAugmenter();
    augmenter.addDriverAugmentation("magic.numbers", new AddsMagicNumberHolder());

    WebDriver augmentedAgain = augmenter.augment(augmented);
    assertThat(augmented).isNotSameAs(augmentedAgain);
    assertThat(augmentedAgain).isInstanceOf(Rotatable.class);
    assertThat(augmentedAgain).isInstanceOf(MagicNumberHolder.class);

    ((Rotatable) augmentedAgain).getOrientation();  // Should not throw.

    assertThat(((HasCapabilities) augmentedAgain).getCapabilities())
        .isSameAs(driver.getCapabilities());
  }

  protected static class StubExecutor implements CommandExecutor {
    private final Capabilities capabilities;
    private final List<Data> expected = new ArrayList<>();

    protected StubExecutor(Capabilities capabilities) {
      this.capabilities = capabilities;
    }

    @Override
    public Response execute(Command command) {
      if (DriverCommand.NEW_SESSION.equals(command.getName())) {
        Response response = new Response(new SessionId("foo"));
        response.setValue(capabilities.asMap());
        return response;
      }

      for (Data possibleMatch : expected) {
        if (possibleMatch.commandName.equals(command.getName()) &&
            possibleMatch.args.equals(command.getParameters())) {
          Response response = new Response(new SessionId("foo"));
          response.setValue(possibleMatch.returnValue);
          return response;
        }
      }

      throw new AssertionError("Unexpected method invocation: " + command);
    }

    public void expect(String commandName, Map<String, ?> args, Object returnValue) {
      expected.add(new Data(commandName, args, returnValue));
    }

    private static class Data {
      public String commandName;
      public Map<String, ?> args;
      public Object returnValue;

      public Data(String commandName, Map<String, ?> args, Object returnValue) {
        this.commandName = commandName;
        this.args = args;
        this.returnValue = returnValue;
      }
    }
  }

  public interface MyInterface {
    String getHelloWorld();
  }

  public static class DetonatingDriver extends RemoteWebDriver {
    private Capabilities caps;

    public void setCapabilities(Capabilities caps) {
      this.caps = caps;
    }

    @Override
    public Capabilities getCapabilities() {
      return caps;
    }

    @Override
    public WebElement findElement(By locator) {
      return super.findElement(locator);
    }

    @Override
    protected WebElement findElement(String by, String using) {
      if ("id".equals(by)) {
        throw new NoSuchElementException("Boom");
      }
      return null;
    }
  }

  public interface MagicNumberHolder {
    int getMagicNumber();
    void setMagicNumber(int number);
  }

  public static class ChildRemoteDriver extends RemoteWebDriver implements MagicNumberHolder {
    private int magicNumber;

    @Override
    public Capabilities getCapabilities() {
      return new FirefoxOptions();
    }

    @Override
    public int getMagicNumber() {
      return magicNumber;
    }

    @Override
    public void setMagicNumber(int magicNumber) {
      this.magicNumber = magicNumber;
    }
  }

  public static class WithFinals extends RemoteWebDriver {
    public final String finalField = "FINAL";

    @Override
    public Capabilities getCapabilities() {
      return new ImmutableCapabilities();
    }
  }

  public abstract BaseAugmenter getAugmenter();

  private static class AddsMagicNumberHolder implements AugmenterProvider {
    @Override
    public Class<?> getDescribedInterface() {
      return MagicNumberHolder.class;
    }

    @Override
    public InterfaceImplementation getImplementation(Object value) {
      return (executeMethod, self, method, args) -> null;
    }
  }
}
