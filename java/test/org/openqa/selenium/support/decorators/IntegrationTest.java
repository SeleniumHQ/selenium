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

package org.openqa.selenium.support.decorators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Method;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

@Tag("UnitTests")
class IntegrationTest {

  static class CountCalls extends WebDriverDecorator<WebDriver> {

    int counterBefore = 0;
    int counterAfter = 0;
    int counterCall = 0;

    @Override
    public void beforeCall(Decorated<?> target, Method method, Object[] args) {
      counterBefore++;
    }

    @Override
    public void afterCall(Decorated<?> target, Method method, Object[] args, Object result) {
      counterAfter++;
    }

    @Override
    public Object call(Decorated<?> target, Method method, Object[] args) throws Throwable {
      counterCall++;
      return super.call(target, method, args);
    }
  }

  @Test
  void canDecorateWebDriverMethods() {
    CountCalls decorator = new CountCalls();
    WebDriver originalDriver = mock(WebDriver.class);
    WebDriver decoratedDriver = decorator.decorate(originalDriver);
    decoratedDriver.get("http://test.com/");
    verify(originalDriver).get("http://test.com/");
    assertThat(decorator.counterBefore).isEqualTo(1);
    assertThat(decorator.counterAfter).isEqualTo(1);
  }

  @Test
  void canDecorateWebElementMethods() {
    CountCalls decorator = new CountCalls();
    WebDriver originalDriver = mock(WebDriver.class);
    WebElement element = mock(WebElement.class);
    when(originalDriver.findElement(any())).thenReturn(element);

    WebDriver decoratedDriver = decorator.decorate(originalDriver);

    WebElement found = decoratedDriver.findElement(By.id("test-id"));
    found.click();

    assertThat(decorator.counterBefore).isEqualTo(2);
    assertThat(decorator.counterAfter).isEqualTo(2);
  }
}
