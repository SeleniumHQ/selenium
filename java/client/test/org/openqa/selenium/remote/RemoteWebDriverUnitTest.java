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

import static java.util.Collections.EMPTY_MAP;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public class RemoteWebDriverUnitTest {

  @Test
  public void returnsEmptyListIfRemoteEndReturnsNullFromFindElements() throws IOException {
    CommandExecutor executor = prepareExecutorMock();

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    List<WebElement> result = driver.findElements(By.id("id"));
    assertThat(result).isNotNull().isEmpty();
  }

  @Test
  public void returnsEmptyListIfRemoteEndReturnsNullFromFindChildren() throws IOException {
    CommandExecutor executor = prepareExecutorMock();

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId("unique");

    List<WebElement> result = element.findElements(By.id("id"));
    assertThat(result).isNotNull().isEmpty();
  }

  @Test
  public void throwsIfRemoteEndReturnsNullFromFindElement() throws IOException {
    CommandExecutor executor = prepareExecutorMock();

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.id("id")));
  }

  @Test
  public void throwIfRemoteEndReturnsNullFromFindChild() throws IOException {
    CommandExecutor executor = prepareExecutorMock();

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId("unique");

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> element.findElement(By.id("id")));
  }

  private CommandExecutor prepareExecutorMock() throws IOException {
    CommandExecutor executor = mock(CommandExecutor.class);
    when(executor.execute(any())).thenAnswer(invocation -> {
      if (invocation.<Command>getArgument(0).getName().equals(DriverCommand.NEW_SESSION)) {
        Response newSessionResponse = new Response();
        newSessionResponse.setValue(EMPTY_MAP);
        newSessionResponse.setSessionId(UUID.randomUUID().toString());
        return newSessionResponse;
      } else {
        Response nullResponse = new Response();
        nullResponse.setValue(null);
        return nullResponse;
      }
    });
    return executor;
  }

}
