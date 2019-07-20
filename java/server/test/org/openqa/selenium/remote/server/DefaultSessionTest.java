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

package org.openqa.selenium.remote.server;

import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;

public class DefaultSessionTest {

  @Test
  public void shouldClearTempFsWhenSessionCloses() {
    final DriverFactory factory = mock(DriverFactory.class);
    when(factory.newInstance(any(Capabilities.class))).thenReturn(mock(WebDriver.class));
    final TemporaryFilesystem tempFs = mock(TemporaryFilesystem.class);

    Session session = DefaultSession.createSession(
        factory, tempFs,
        new DesiredCapabilities(BrowserType.FIREFOX, "10", Platform.ANY));

    session.close();
    verify(tempFs).deleteTemporaryFiles();
    verify(tempFs).deleteBaseDir();
  }

}
