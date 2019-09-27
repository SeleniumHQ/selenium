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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_JAVASCRIPT;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENT;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;

public class AugmenterTest extends BaseAugmenterTest {

  @Override
  public BaseAugmenter getAugmenter() {
    return new Augmenter();
  }

  @Test
  public void shouldAllowReflexiveCalls() {
    Capabilities caps = new ImmutableCapabilities(CapabilityType.SUPPORTS_FINDING_BY_CSS, true);
    StubExecutor executor = new StubExecutor(caps);
    final WebElement element = mock(WebElement.class);
    executor.expect(FIND_ELEMENT, ImmutableMap.of("using", "css selector", "value", "cheese"),
        element);

    WebDriver driver = new RemoteWebDriver(executor, caps);
    WebDriver returned = getAugmenter().augment(driver);

    returned.findElement(By.cssSelector("cheese"));
    // No exception is a Good Thing
  }

  @Test
  public void canUseTheAugmenterToInterceptConcreteMethodCalls() throws Exception {
    Capabilities caps = new ImmutableCapabilities(SUPPORTS_JAVASCRIPT, true);
    StubExecutor stubExecutor = new StubExecutor(caps);
    stubExecutor.expect(DriverCommand.GET_TITLE, new HashMap<>(), "StubTitle");

    final WebDriver driver = new RemoteWebDriver(stubExecutor, caps);

    // Our AugmenterProvider needs to target the class that declares quit(),
    // otherwise the Augmenter won't apply the method interceptor.
    final Method quitMethod = driver.getClass().getMethod("quit");

    AugmenterProvider augmentation = new AugmenterProvider() {
      @Override
      public Class<?> getDescribedInterface() {
        return quitMethod.getDeclaringClass();
      }

      @Override
      public InterfaceImplementation getImplementation(Object value) {
        return (executeMethod, self, method, args) -> {
          if (quitMethod.equals(method)) {
            return null;
          }

          try {
            return method.invoke(driver, args);
          } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
          } catch (InvocationTargetException e) {
            throw new RuntimeException(e.getTargetException());
          }
        };
      }
    };

    BaseAugmenter augmenter = getAugmenter();

    // Set the capability that triggers the augmentation.
    augmenter.addDriverAugmentation(CapabilityType.SUPPORTS_JAVASCRIPT, augmentation);

    WebDriver returned = augmenter.augment(driver);
    assertThat(returned).isNotSameAs(driver);
    assertThat(returned.getTitle()).isEqualTo("StubTitle");

    returned.quit();   // Should not fail because it's intercepted.

    // Verify original is unmodified.
    assertThatExceptionOfType(AssertionError.class)
        .isThrownBy(driver::quit)
        .withMessageStartingWith("Unexpected method invocation");
  }

  @Test
  public void shouldNotAugmentRemoteWebDriverWithoutExtraCapabilities() {
    Capabilities caps = new ImmutableCapabilities();
    StubExecutor stubExecutor = new StubExecutor(caps);
    WebDriver driver = new RemoteWebDriver(stubExecutor, caps);

    WebDriver augmentedDriver = getAugmenter().augment(driver);

    assertThat(augmentedDriver).isSameAs(driver);
  }

  @Test
  public void shouldAugmentRemoteWebDriverWithExtraCapabilities() {
    Capabilities caps = new ImmutableCapabilities(CapabilityType.SUPPORTS_WEB_STORAGE, true);
    StubExecutor stubExecutor = new StubExecutor(caps);
    WebDriver driver = new RemoteWebDriver(stubExecutor, caps);

    WebDriver augmentedDriver = getAugmenter().augment(driver);

    assertThat(augmentedDriver).isNotSameAs(driver);
  }

  public static class RemoteWebDriverSubclass extends RemoteWebDriver {
    public RemoteWebDriverSubclass(CommandExecutor stubExecutor, Capabilities caps) {
      super(stubExecutor, caps);
    }
  }

  @Test
  public void shouldNotAugmentSubclassesOfRemoteWebDriver() {
    Capabilities caps = new ImmutableCapabilities();
    StubExecutor stubExecutor = new StubExecutor(caps);
    WebDriver driver = new RemoteWebDriverSubclass(stubExecutor, caps);

    WebDriver augmentedDriver = getAugmenter().augment(driver);

    assertThat(augmentedDriver).isSameAs(driver);
  }
}
