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

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.function.Consumer;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;

@Tag("UnitTests")
class DecoratedNavigationTest {

  private static class Fixture {

    WebDriver originalDriver;
    WebDriver decoratedDriver;
    WebDriver.Navigation original;
    WebDriver.Navigation decorated;

    public Fixture() {
      original = mock(WebDriver.Navigation.class);
      originalDriver = mock(WebDriver.class);
      when(originalDriver.navigate()).thenReturn(original);
      decoratedDriver = new WebDriverDecorator<>().decorate(originalDriver);
      decorated = decoratedDriver.navigate();
    }
  }

  private void verifyFunction(Consumer<WebDriver.Navigation> f) {
    Fixture fixture = new Fixture();
    f.accept(fixture.decorated);
    f.accept(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  @Test
  void toAddressAsString() {
    verifyFunction($ -> $.to("test"));
  }

  @Test
  void toAddressAsUrl() throws MalformedURLException {
    final URL url = new URL("http://www.selenium2.ru/");
    verifyFunction($ -> $.to(url));
  }

  @Test
  void back() {
    verifyFunction(WebDriver.Navigation::back);
  }

  @Test
  void forward() {
    verifyFunction(WebDriver.Navigation::forward);
  }

  @Test
  void refresh() {
    verifyFunction(WebDriver.Navigation::refresh);
  }
}
