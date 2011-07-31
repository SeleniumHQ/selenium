package org.openqa.selenium;

import org.jmock.Sequence;
import org.jmock.integration.junit4.JUnit4Mockery;
import org.junit.After;
import org.junit.Before;

public abstract class MockTestBase {
  private JUnit4Mockery context;

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

  public void checking(org.jmock.internal.ExpectationBuilder expectations) {
    context.checking(expectations);
  }

  public Sequence sequence(java.lang.String name) {
    return context.sequence(name);
  }
}
