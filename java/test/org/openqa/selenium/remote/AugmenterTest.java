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

import com.google.common.collect.ImmutableMap;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.support.decorators.Decorated;
import org.openqa.selenium.support.decorators.WebDriverDecorator;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENT;

@Tag("UnitTests")
class AugmenterTest {

  private Augmenter getAugmenter() {
    return new Augmenter();
  }

  @Test
  void shouldAugmentRotatable() {
    final Capabilities caps = new ImmutableCapabilities(CapabilityType.ROTATABLE, true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = getAugmenter().augment(driver);

    assertThat(returned).isNotSameAs(driver);
    assertThat(returned).isInstanceOf(Rotatable.class);
  }

  @Test
  void shouldAugmentLocationContext() {
    final Capabilities
      caps =
      new ImmutableCapabilities(CapabilityType.SUPPORTS_LOCATION_CONTEXT, true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = getAugmenter().augment(driver);

    assertThat(returned).isNotSameAs(driver);
    assertThat(returned).isInstanceOf(LocationContext.class);
  }

  @Test
  void shouldAddInterfaceFromCapabilityIfNecessary() {
    final Capabilities caps = new ImmutableCapabilities("magic.numbers", true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = getAugmenter()
      .addDriverAugmentation("magic.numbers", HasMagicNumbers.class, (c, exe) -> () -> 42)
      .augment(driver);

    assertThat(returned).isNotSameAs(driver);
    assertThat(returned).isInstanceOf(HasMagicNumbers.class);
  }

  @Test
  void shouldNotAddInterfaceWhenBooleanValueForItIsFalse() {
    Capabilities caps = new ImmutableCapabilities("magic.numbers", false);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = getAugmenter()
      .addDriverAugmentation("magic.numbers", HasMagicNumbers.class, (c, exe) -> () -> 42)
      .augment(driver);

    assertThat(returned).isSameAs(driver);
    assertThat(returned).isNotInstanceOf(HasMagicNumbers.class);
  }

  @Test
  void shouldNotUseNonMatchingInterfaces() {
    Capabilities caps = new ImmutableCapabilities("magic.numbers", true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = getAugmenter()
      .addDriverAugmentation("magic.numbers", HasMagicNumbers.class, (c, exe) -> () -> 42)
      .augment(driver);
    assertThat(returned).isNotInstanceOf(WebStorage.class);
  }

  @Test
  void shouldDelegateToHandlerIfAdded() {
    Capabilities caps = new ImmutableCapabilities("foo", true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = getAugmenter()
      .addDriverAugmentation(
        "foo",
        MyInterface.class,
        (c, exe) -> () -> "Hello World")
      .augment(driver);

    String text = ((MyInterface) returned).getHelloWorld();
    assertThat(text).isEqualTo("Hello World");
  }

  @Test
  void shouldDelegateUnmatchedMethodCallsToDriverImplementation() {
    Capabilities caps = new ImmutableCapabilities("magic.numbers", true);
    StubExecutor stubExecutor = new StubExecutor(caps);
    stubExecutor.expect(DriverCommand.GET_TITLE, new HashMap<>(), "Title");
    WebDriver driver = new RemoteWebDriver(stubExecutor, caps);

    WebDriver returned = getAugmenter()
      .addDriverAugmentation(
        "magic.numbers",
        HasMagicNumbers.class,
        (c, exe) -> () -> 42)
      .augment(driver);

    assertThat(returned.getTitle()).isEqualTo("Title");
  }

  @Test
  void proxyShouldNotAppearInStackTraces() {
    // This will force the class to be enhanced
    final Capabilities caps = new ImmutableCapabilities("magic.numbers", true);

    DetonatingDriver driver = new DetonatingDriver();
    driver.setCapabilities(caps);

    WebDriver returned = getAugmenter()
      .addDriverAugmentation(
        "magic.numbers",
        HasMagicNumbers.class,
        (c, exe) -> () -> 42)
      .augment(driver);

    assertThatExceptionOfType(NoSuchElementException.class)
      .isThrownBy(() -> returned.findElement(By.id("ignored")));
  }

  @Test
  void shouldCopyFieldsFromTemplateInstanceIntoChildInstance() {
    ChildRemoteDriver driver = new ChildRemoteDriver();
    HasMagicNumbers holder = (HasMagicNumbers) getAugmenter().augment(driver);

    assertThat(holder.getMagicNumber()).isEqualTo(3);
  }

  @Test
  void shouldNotChokeOnFinalFields() {
    WithFinals withFinals = new WithFinals();
    getAugmenter().augment(withFinals);
  }

  @Test
  void shouldAllowReflexiveCalls() {
    Capabilities caps = new ImmutableCapabilities("find by magic", true);
    StubExecutor executor = new StubExecutor(caps);
    final WebElement element = mock(WebElement.class);
    executor.expect(
      FIND_ELEMENT,
      ImmutableMap.of("using", "magic", "value", "cheese"),
      element);

    WebDriver driver = new RemoteWebDriver(executor, caps);
    WebDriver returned = getAugmenter()
      .addDriverAugmentation(
        "find by magic",
        FindByMagic.class,
        (c, exe) -> magicWord -> element)
      .augment(driver);

    // No exception is a Good Thing
    WebElement seen = returned.findElement(new ByMagic("cheese"));
    assertThat(seen).isSameAs(element);
  }

  @Test
  void shouldAugmentMultipleInterfaces() {
    final Capabilities caps = new ImmutableCapabilities("magic.numbers", true,
                                                        "numbers", true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver returned = getAugmenter()
      .addDriverAugmentation("magic.numbers", HasMagicNumbers.class, (c, exe) -> () -> 42)
      .addDriverAugmentation("numbers", HasNumbers.class, (c, exe) -> webDriver -> {
        Require.precondition(webDriver instanceof HasMagicNumbers,
                             "Driver must implement HasMagicNumbers");
        return ((HasMagicNumbers) webDriver).getMagicNumber();
      })
      .augment(driver);

    assertThat(returned).isNotSameAs(driver);
    assertThat(returned).isInstanceOf(HasMagicNumbers.class);
    assertThat(returned).isInstanceOf(HasNumbers.class);

    int number = ((HasNumbers) returned).getNumbers(returned);
    assertThat(number).isEqualTo(42);
  }

  @Test
  void shouldAugmentWebDriverDecorator() {
    final Capabilities
      caps =
      new ImmutableCapabilities(CapabilityType.SUPPORTS_LOCATION_CONTEXT, true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver decorated = new ModifyTitleWebDriverDecorator().decorate(driver);

    assertThat(decorated).isNotSameAs(driver);

    WebDriver returned = getAugmenter().augment(decorated);

    assertThat(returned).isNotSameAs(driver);
    assertThat(returned).isNotSameAs(decorated);
    assertThat(returned).isInstanceOf(LocationContext.class);

    String title = returned.getTitle();

    assertThat(title).isEqualTo("title");
  }

  @Test
  void shouldDecorateAugmentedWebDriver() {
    final Capabilities caps = new ImmutableCapabilities("magic.numbers", true,
                                                        "numbers", true);
    WebDriver driver = new RemoteWebDriver(new StubExecutor(caps), caps);

    WebDriver augmented = getAugmenter()
      .addDriverAugmentation("magic.numbers", HasMagicNumbers.class, (c, exe) -> () -> 42)
      .addDriverAugmentation("numbers", HasNumbers.class, (c, exe) -> webDriver -> {
        Require.precondition(webDriver instanceof HasMagicNumbers,
                             "Driver must implement HasMagicNumbers");
        return ((HasMagicNumbers) webDriver).getMagicNumber();
      })
      .augment(driver);

    WebDriver decorated = new ModifyTitleWebDriverDecorator().decorate(augmented);

    assertThat(decorated).isNotSameAs(driver);

    assertThat(augmented).isNotSameAs(decorated);
    assertThat(decorated).isInstanceOf(HasNumbers.class);

    String title = decorated.getTitle();

    assertThat(title).isEqualTo("title");

    int number = ((HasNumbers) decorated).getNumbers(decorated);
    assertThat(number).isEqualTo(42);
  }

  private static class ByMagic extends By {

    private final String magicWord;

    public ByMagic(String magicWord) {
      this.magicWord = magicWord;
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      return Collections.singletonList(((FindByMagic) context).findByMagic(magicWord));
    }
  }

  public interface FindByMagic {

    WebElement findByMagic(String magicWord);
  }

  @Test
  void shouldBeAbleToAugmentMultipleTimes() {
    Capabilities caps = new ImmutableCapabilities("rotatable", true, "magic.numbers", true);

    StubExecutor stubExecutor = new StubExecutor(caps);
    stubExecutor.expect(DriverCommand.GET_SCREEN_ORIENTATION,
                        Collections.emptyMap(),
                        ScreenOrientation.PORTRAIT.name());
    RemoteWebDriver driver = new RemoteWebDriver(stubExecutor, caps);

    WebDriver augmented = getAugmenter().augment(driver);

    assertThat(driver).isNotSameAs(augmented);
    assertThat(augmented).isInstanceOf(Rotatable.class);
    assertThat(augmented).isNotInstanceOf(HasMagicNumbers.class);

    WebDriver augmentedAgain = getAugmenter()
      .addDriverAugmentation(
        "magic.numbers",
        HasMagicNumbers.class,
        (c, exe) -> () -> 42)
      .augment(augmented);

    assertThat(augmented).isNotSameAs(augmentedAgain);
    assertThat(augmentedAgain).isInstanceOf(Rotatable.class);
    assertThat(augmentedAgain).isInstanceOf(HasMagicNumbers.class);

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
      if (locator instanceof By.Remotable) {
        if ("id".equals(((By.Remotable) locator).getRemoteParameters().using())) {
          throw new NoSuchElementException("Boom");
        }
      }
      return null;
    }
  }

  public interface HasNumbers {

    int getNumbers(WebDriver driver);
  }

  public static class ChildRemoteDriver extends RemoteWebDriver implements HasMagicNumbers {

    private int magicNumber = 3;

    @Override
    public Capabilities getCapabilities() {
      return new FirefoxOptions();
    }

    @Override
    public int getMagicNumber() {
      return magicNumber;
    }
  }

  public static class WithFinals extends RemoteWebDriver {

    public final String finalField = "FINAL";

    @Override
    public Capabilities getCapabilities() {
      return new ImmutableCapabilities();
    }
  }

  private static class ModifyTitleWebDriverDecorator extends WebDriverDecorator<WebDriver> {

    @Override
    public Object call(Decorated<?> target, Method method, Object[] args) throws Throwable {
      if (method.getDeclaringClass().equals(HasCapabilities.class)) {
        return new ImmutableCapabilities(CapabilityType.SUPPORTS_LOCATION_CONTEXT, true);
      }

      if (method.getName().equals("getTitle")) {
        return "title";
      }

      return super.call(target, method, args);
    }
  }

}
