/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DefaultDriverSessions;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.StubHandler;

import junit.framework.TestCase;
import org.jmock.Expectations;
import org.jmock.integration.junit4.JUnit4Mockery;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.logging.Logger;

public class UrlMapperTest extends TestCase {
  private final static Logger log = Logger.getLogger(UrlMapperTest.class.getName());

  private JUnit4Mockery context;
  private UrlMapper mapper;

  @Override
  protected void setUp() {
    context = new JUnit4Mockery();
    mapper = new UrlMapper(new DefaultDriverSessions(), log);
  }

  @Override
  protected void tearDown() {
    context.assertIsSatisfied();
  }

  public void testShouldBePossibleToBindAHandler() throws Exception {
    mapper.bind("/foo", StubHandler.class);

    ResultConfig config = mapper.getConfig("/foo");

    assertThat(config, is(notNullValue()));
  }

  public void testShouldInjectDependenciesViaTheConstructor() throws Exception {
    mapper.bind("/example", SessionHandler.class);

    ResultConfig config = mapper.getConfig("/example");
    SessionHandler handler = (SessionHandler) config.getHandler("/example", new SessionId("test"));

    assertThat(handler.getSessions(), is(notNullValue()));
  }

  public void testAppliesGlobalHandlersToNewConfigs() {
    Renderer renderer = new StubRenderer();
    Result result = new Result("", renderer);
    HttpServletRequest mockRequest = context.mock(HttpServletRequest.class);

    mapper.addGlobalHandler(ResultType.SUCCESS, result);
    mapper.bind("/example", SessionHandler.class);

    ResultConfig config = mapper.getConfig("/example");
    assertEquals(renderer, config.getRenderer(ResultType.SUCCESS, mockRequest));
  }

  public void testAppliesNewGlobalHandlersToExistingConfigs() {
    Renderer renderer = new StubRenderer();
    Result result = new Result("", renderer);
    HttpServletRequest mockRequest = context.mock(HttpServletRequest.class);

    mapper.bind("/example", SessionHandler.class);
    mapper.addGlobalHandler(ResultType.SUCCESS, result);

    ResultConfig config = mapper.getConfig("/example");
    assertEquals(renderer, config.getRenderer(ResultType.SUCCESS, mockRequest));
  }

  public void testPermitsMultipleGlobalHandlersWithDifferentMimeTypes() {
    Renderer renderer = new StubRenderer();

    final HttpServletRequest mockRequest = context.mock(HttpServletRequest.class);

    context.checking(new Expectations() {{
      allowing(mockRequest).getHeader("Accept");
      will(returnValue("application/json"));
    }});

    mapper.addGlobalHandler(ResultType.SUCCESS, new Result("", new StubRenderer()));
    mapper.addGlobalHandler(ResultType.SUCCESS, new Result("application/json", renderer ));
    mapper.bind("/example", SessionHandler.class)
        .on(ResultType.SUCCESS, new Result("text/plain", new StubRenderer()));

    ResultConfig config = mapper.getConfig("/example");
    assertEquals(renderer, config.getRenderer(ResultType.SUCCESS, mockRequest));
  }

  public static class SessionHandler implements Handler {

    private final DriverSessions sessions;

    public SessionHandler(DriverSessions sessions) {
      this.sessions = sessions;
    }

    public DriverSessions getSessions() {
      return sessions;
    }

    public ResultType handle() {
      return ResultType.SUCCESS;
    }
  }

  private static class StubRenderer implements Renderer {
    public void render(HttpServletRequest request, HttpServletResponse response, Handler handler) throws Exception {
    }
  }
}
