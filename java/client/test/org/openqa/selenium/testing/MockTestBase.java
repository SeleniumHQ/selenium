/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.testing;

import org.jmock.Expectations;
import org.jmock.Sequence;
import org.jmock.integration.junit4.JUnit4Mockery;
import org.junit.After;
import org.junit.Before;

public abstract class MockTestBase {
  protected JUnit4Mockery context;

  @Before
  public void createContext() {
    context = new JUnit4Mockery();
  }

  @After
  public void checkContext() {
    context.assertIsSatisfied();
  }

  public <T> T mock(java.lang.Class<T> typeToMock) {
    return context.mock(typeToMock);
  }

  public <T> T mock(java.lang.Class<T> typeToMock, String name) {
    return context.mock(typeToMock, name);
  }

  public void checking(Expectations expectations) {
    context.checking(expectations);
  }

  public Sequence sequence(java.lang.String name) {
    return context.sequence(name);
  }
}
