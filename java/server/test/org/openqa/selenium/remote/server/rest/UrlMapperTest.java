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

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DefaultDriverSessions;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.HttpRequest;
import org.openqa.selenium.remote.server.HttpResponse;
import org.openqa.selenium.remote.server.StubHandler;
import org.openqa.selenium.remote.server.renderer.JsonResult;

import java.util.logging.Logger;

public class UrlMapperTest {
  private final static Logger log = Logger.getLogger(UrlMapperTest.class.getName());

  private UrlMapper mapper;

  @Before
  public void setUp() {
    JsonResult renderer = new JsonResult("success");
    mapper = new UrlMapper(new DefaultDriverSessions(), log, renderer, renderer);
  }

  @Test
  public void testShouldBePossibleToBindAHandler() throws Exception {
    mapper.bind("/foo", StubHandler.class);

    ResultConfig config = mapper.getConfig("/foo");

    assertThat(config, is(notNullValue()));
  }

  @Test
  public void testShouldInjectDependenciesViaTheConstructor() throws Exception {
    mapper.bind("/example", SessionHandler.class);

    ResultConfig config = mapper.getConfig("/example");
    SessionHandler handler = (SessionHandler) config.getHandler("/example", new SessionId("test"));

    assertThat(handler.getSessions(), is(notNullValue()));
  }

  public static class SessionHandler implements RestishHandler {

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
}
