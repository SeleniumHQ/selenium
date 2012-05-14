/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.remote.server.rest;

import org.jmock.Expectations;
import org.jmock.integration.junit4.JUnit4Mockery;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.HttpRequest;
import org.openqa.selenium.remote.server.StubHandler;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.UndeclaredThrowableException;
import java.util.concurrent.ExecutionException;
import java.util.logging.Logger;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

public class ResultConfigTest {
  private Logger logger = Logger.getLogger(ResultConfigTest.class.getName());
  private static final SessionId dummySessionId = new SessionId("Test");

  private JUnit4Mockery context;

  @Before
  public void setUp() {
    context = new JUnit4Mockery();
  }

  @After
  public void tearDown() {
    context.assertIsSatisfied();
  }

  @Test
  public void testShouldMatchBasicUrls() throws Exception {
    ResultConfig config = new ResultConfig("/fish", StubHandler.class, null, logger);

    assertThat(config.getHandler("/fish", dummySessionId), is(notNullValue()));
    assertThat(config.getHandler("/cod", dummySessionId), is(nullValue()));
  }

  @Test
  public void testShouldNotAllowNullToBeUsedAsTheUrl() {
    try {
      new ResultConfig(null, StubHandler.class, null, logger);
      fail("Should have failed");
    } catch (IllegalArgumentException e) {
      exceptionWasExpected();
    }
  }

  @Test
  public void testShouldNotAllowNullToBeUsedForTheHandler() {
    try {
      new ResultConfig("/cheese", null, null, logger);
      fail("Should have failed");
    } catch (IllegalArgumentException e) {
      exceptionWasExpected();
    }
  }

  @Test
  public void testShouldMatchNamedParameters() throws Exception {
    ResultConfig config = new ResultConfig("/foo/:bar", NamedParameterHandler.class, null, logger);
    RestishHandler handler = config.getHandler("/foo/fishy", dummySessionId);

    assertThat(handler, is(notNullValue()));
  }

  @Test
  public void testShouldSetNamedParametersOnHandler() throws Exception {
    ResultConfig config = new ResultConfig("/foo/:bar", NamedParameterHandler.class, null, logger);
    NamedParameterHandler handler =
        (NamedParameterHandler) config.getHandler("/foo/fishy", dummySessionId);

    assertThat(handler.getBar(), is("fishy"));
  }

  @SuppressWarnings({"ThrowableResultOfMethodCallIgnored"})
  @Test
  public void testShouldGracefullyHandleNullInputs() {
    ResultConfig config = new ResultConfig("/foo/:bar", StubHandler.class, null, logger);
    assertNull(config.getRootExceptionCause(null));
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  @Test
  public void testCanPeelNestedExceptions() {
    RuntimeException runtime = new RuntimeException("root of all evils");
    InvocationTargetException invocation = new InvocationTargetException(runtime,
        "Got Runtime Exception");
    WebDriverException webdriverException = new WebDriverException("Invocation problems",
        invocation);
    ExecutionException execution = new ExecutionException("General WebDriver error",
        webdriverException);

    ResultConfig config = new ResultConfig("/foo/:bar", StubHandler.class, null, logger);
    Throwable toClient = config.getRootExceptionCause(execution);
    assertEquals(toClient, runtime);
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  @Test
  public void testDoesNotPeelTooManyLayersFromNestedExceptions() {
    RuntimeException runtime = new RuntimeException("root of all evils");
    NoSuchElementException noElement = new NoSuchElementException("no soup for you", runtime);
    InvocationTargetException invocation = new InvocationTargetException(noElement);
    UndeclaredThrowableException undeclared = new UndeclaredThrowableException(invocation);

    ResultConfig config = new ResultConfig("/foo/:bar", StubHandler.class, null, logger);
    Throwable toClient = config.getRootExceptionCause(undeclared);
    assertEquals(noElement, toClient);
  }

  @Test
  public void testFailsWhenUnableToDetermineResultTypeForRequest_noHandlersRegistered() {
    ResultConfig config = new ResultConfig("/foo/:bar", StubHandler.class, null, logger);
    final HttpRequest mockRequest = context.mock(HttpRequest.class);

    context.checking(new Expectations());

    try {
      config.getRenderer(ResultType.EXCEPTION, mockRequest);
      fail("Should have thrown a NPE");
    } catch (NullPointerException expected) {
    }
  }

  @Test
  public void testSelectsFirstAvailableRendererWhenThereAreNoMimeTypesSpecified() {
    Renderer mockRenderer1 = context.mock(Renderer.class, "renderer1");
    Renderer mockRenderer2 = context.mock(Renderer.class, "renderer2");
    final HttpRequest mockRequest = context.mock(HttpRequest.class);

    context.checking(new Expectations() {{
      allowing(mockRequest).getHeader("Accept");
      will(returnValue("application/json"));
    }});

    ResultConfig config = new ResultConfig("/foo/:bar", StubHandler.class, null, logger)
        .on(ResultType.SUCCESS, mockRenderer1)
        .on(ResultType.SUCCESS, mockRenderer2);

    assertEquals(mockRenderer1, config.getRenderer(ResultType.SUCCESS, mockRequest));
  }

  @Test
  public void testSelectsRenderWithMimeTypeMatch() {
    Renderer mockRenderer1 = context.mock(Renderer.class, "renderer1");
    Renderer mockRenderer2 = context.mock(Renderer.class, "renderer2");
    final HttpRequest mockRequest = context.mock(HttpRequest.class);

    context.checking(new Expectations() {{
      one(mockRequest).getHeader("Accept");
      will(returnValue("application/json"));
    }});

    ResultConfig config = new ResultConfig("/foo/:bar", StubHandler.class, null, logger)
        .on(ResultType.SUCCESS, mockRenderer1)
        .on(ResultType.SUCCESS, mockRenderer2, "application/json");

    assertEquals(mockRenderer2, config.getRenderer(ResultType.SUCCESS, mockRequest));
  }

  @Test
  public void testUsesFirstRegisteredRendererWhenNoMimeTypeMatches() {
    Renderer mockRenderer1 = context.mock(Renderer.class, "renderer1");
    Renderer mockRenderer2 = context.mock(Renderer.class, "renderer2");
    final HttpRequest mockRequest = context.mock(HttpRequest.class);

    context.checking(new Expectations() {{
      one(mockRequest).getHeader("Accept");
      will(returnValue("application/json"));
    }});

    ResultConfig config = new ResultConfig("/foo/:bar", StubHandler.class, null, logger)
        .on(ResultType.SUCCESS, mockRenderer1, "text/html")
        .on(ResultType.SUCCESS, mockRenderer2);

    assertEquals(mockRenderer1, config.getRenderer(ResultType.SUCCESS, mockRequest));
  }

  @Test
  public void testSkipsRenderersThatRequireASpecificTypeOfMimeType() {
    Renderer mockRenderer1 = context.mock(Renderer.class, "renderer1");
    Renderer mockRenderer2 = context.mock(Renderer.class, "renderer2");
    final HttpRequest mockRequest = context.mock(HttpRequest.class);

    context.checking(new Expectations() {{
      one(mockRequest).getHeader("Accept");
      will(returnValue("application/json"));
    }});

    ResultConfig config = new ResultConfig("/foo/:bar", StubHandler.class, null, logger)
        .on(ResultType.SUCCESS, new Result("text/html", mockRenderer1, true))
        .on(ResultType.SUCCESS, mockRenderer2);

    assertEquals(mockRenderer2, config.getRenderer(ResultType.SUCCESS, mockRequest));
  }

  private void exceptionWasExpected() {
  }

  public static class NamedParameterHandler implements RestishHandler {

    private String bar;

    public String getBar() {
      return bar;
    }

    @SuppressWarnings({"UnusedDeclaration"})
    public void setBar(String bar) {
      this.bar = bar;
    }

    public ResultType handle() {
      return ResultType.SUCCESS;
    }
  }

}
