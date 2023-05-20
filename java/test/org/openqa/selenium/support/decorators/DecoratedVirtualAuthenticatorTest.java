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
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import java.util.ArrayList;
import java.util.function.Consumer;
import java.util.function.Function;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.virtualauthenticator.Credential;
import org.openqa.selenium.virtualauthenticator.HasVirtualAuthenticator;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticator;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticatorOptions;

@Tag("UnitTests")
class DecoratedVirtualAuthenticatorTest {

  private static class Fixture {

    WebDriver originalDriver;
    WebDriver decoratedDriver;
    VirtualAuthenticator original;
    VirtualAuthenticator decorated;

    public Fixture() {
      original = mock(VirtualAuthenticator.class);
      originalDriver =
          mock(WebDriver.class, withSettings().extraInterfaces(HasVirtualAuthenticator.class));
      when(((HasVirtualAuthenticator) originalDriver).addVirtualAuthenticator(any()))
          .thenReturn(original);
      decoratedDriver = new WebDriverDecorator().decorate(originalDriver);
      decorated =
          ((HasVirtualAuthenticator) decoratedDriver)
              .addVirtualAuthenticator(new VirtualAuthenticatorOptions());
    }
  }

  private void verifyFunction(Consumer<VirtualAuthenticator> f) {
    Fixture fixture = new Fixture();
    f.accept(fixture.decorated);
    f.accept(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  private <R> void verifyFunction(Function<VirtualAuthenticator, R> f, R result) {
    Fixture fixture = new Fixture();
    when(f.apply(fixture.original)).thenReturn(result);
    assertThat(f.apply(fixture.decorated)).isEqualTo(result);
    R ignore = f.apply(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  @Test
  void getId() {
    verifyFunction(VirtualAuthenticator::getId, "test");
  }

  @Test
  void addCredential() {
    Credential credential = mock(Credential.class);
    verifyFunction($ -> $.addCredential(credential));
  }

  @Test
  void getCredentials() {
    verifyFunction(VirtualAuthenticator::getCredentials, new ArrayList<>());
  }

  @Test
  void removeCredentialByByteArray() {
    verifyFunction($ -> $.removeCredential("test".getBytes()));
  }

  @Test
  void removeCredentialByString() {
    verifyFunction($ -> $.removeCredential("test"));
  }

  @Test
  void removeAllCredentials() {
    verifyFunction(VirtualAuthenticator::removeAllCredentials);
  }

  @Test
  void setUserVerified() {
    verifyFunction($ -> $.setUserVerified(true));
  }
}
