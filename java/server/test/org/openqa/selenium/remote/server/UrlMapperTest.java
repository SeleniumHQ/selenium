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

package org.openqa.selenium.remote.server;

import junit.framework.TestCase;

import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.ResultConfig;
import org.openqa.selenium.remote.server.rest.ResultType;
import org.openqa.selenium.remote.server.rest.UrlMapper;

import java.util.logging.Logger;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

public class UrlMapperTest extends TestCase {
  private final static Logger log = Logger.getLogger(UrlMapperTest.class.getName());

  public void testShouldBePossibleToBindAHandler() throws Exception {
    UrlMapper mapper = new UrlMapper(new DefaultDriverSessions(), log);

    mapper.bind("/foo", StubHandler.class);

    ResultConfig config = mapper.getConfig("/foo");

    assertThat(config, is(notNullValue()));
  }

  public void testShouldInjectDependenciesViaTheConstructor() throws Exception {
    DriverSessions sessions = new DefaultDriverSessions();
    UrlMapper mapper = new UrlMapper(sessions, log);
    mapper.bind("/example", SessionHandler.class);

    ResultConfig config = mapper.getConfig("/example");
    SessionHandler handler = (SessionHandler) config.getHandler("/example");

    assertThat(handler.getSessions(), is(notNullValue()));
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
}
