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

import org.jmock.Expectations;
import org.jmock.lib.legacy.ClassImposteriser;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.MockTestBase;

public class DefaultSessionTest extends MockTestBase {

  @Before
  public void addImposteriser() {
    context.setImposteriser(ClassImposteriser.INSTANCE);
  }

  @Test
  public void shouldClearTempFsWhenSessionCloses() throws Exception {
    final DriverFactory factory = new StubDriverFactory();
    final TemporaryFilesystem tempFs = mock(TemporaryFilesystem.class);

    checking(new Expectations() {{
      oneOf(tempFs).deleteTemporaryFiles();
      oneOf(tempFs).deleteBaseDir();
    }});

    Session session = DefaultSession.createSession(factory, tempFs, null, DesiredCapabilities.firefox());

    session.close();
  }

}
