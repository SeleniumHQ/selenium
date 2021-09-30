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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.Alert;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.UnitTests;

import java.util.function.Consumer;
import java.util.function.Function;

@Category(UnitTests.class)
public class DecoratedAlertTest {

  private static class Fixture {
    WebDriver originalDriver;
    WebDriver decoratedDriver;
    WebDriver.TargetLocator originalSwitch;
    Alert original;
    Alert decorated;

    public Fixture() {
      original = mock(Alert.class);
      originalSwitch = mock(WebDriver.TargetLocator.class);
      originalDriver = mock(WebDriver.class);
      when(originalSwitch.alert()).thenReturn(original);
      when(originalDriver.switchTo()).thenReturn(originalSwitch);
      decoratedDriver = new WebDriverDecorator().decorate(originalDriver);
      decorated = decoratedDriver.switchTo().alert();
    }
  }

  private void verifyFunction(Consumer<Alert> f) {
    Fixture fixture = new Fixture();
    f.accept(fixture.decorated);
    f.accept(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  private <R> void verifyFunction(Function<Alert, R> f, R result) {
    Fixture fixture = new Fixture();
    when(f.apply(fixture.original)).thenReturn(result);
    assertThat(f.apply(fixture.decorated)).isEqualTo(result);
    R ignore = f.apply(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  @Test
  public void sendKeys() {
    verifyFunction($ -> $.sendKeys("test"));
  }

  @Test
  public void accept() {
    verifyFunction(Alert::accept);
  }

  @Test
  public void dismiss() {
    verifyFunction(Alert::dismiss);
  }

  @Test
  public void getText() {
    verifyFunction(Alert::getText, "test");
  }
}
