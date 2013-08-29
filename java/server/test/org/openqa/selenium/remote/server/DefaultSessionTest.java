/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.remote.server;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.junit.Test;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.DesiredCapabilities;

public class DefaultSessionTest {

  @Test
  public void shouldClearTempFsWhenSessionCloses() throws Exception {
    final DriverFactory factory = new StubDriverFactory();
    final TemporaryFilesystem tempFs = mock(TemporaryFilesystem.class);

    Session session = DefaultSession.createSession(factory, tempFs, null, DesiredCapabilities.firefox());

    session.close();
    verify(tempFs).deleteTemporaryFiles();
    verify(tempFs).deleteBaseDir();
  }

}
