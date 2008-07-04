package org.openqa.selenium.remote.server;

import junit.framework.TestCase;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.ResultConfig;
import org.openqa.selenium.remote.server.rest.ResultType;

public class ResultConfigTest extends TestCase {

  public void testShouldMatchBasicUrls() throws Exception {
    ResultConfig config = new ResultConfig("/fish", StubHandler.class, null);

    assertThat(config.getHandler("/fish"), is(notNullValue()));
    assertThat(config.getHandler("/cod"), is(nullValue()));
  }

  public void testShouldNotAllowNullToBeUsedAsTheUrl() {
    try {
      new ResultConfig(null, StubHandler.class, null);
      fail("Should have failed");
    } catch (IllegalArgumentException e) {
      exceptionWasExpected();
    }
  }

  public void testShouldNotAllowNullToBeUsedForTheHandler() {
    try {
      new ResultConfig("/cheese", null, null);
      fail("Should have failed");
    } catch (IllegalArgumentException e) {
      exceptionWasExpected();
    }
  }

  public void testShouldMatchNamedParameters() throws Exception {
    ResultConfig config = new ResultConfig("/foo/:bar", NamedParameterHandler.class, null);
    Handler handler = (NamedParameterHandler) config.getHandler("/foo/fishy");

    assertThat(handler, is(notNullValue()));
  }

  public void testShouldSetNamedParametersOnHandler() throws Exception {
    ResultConfig config = new ResultConfig("/foo/:bar", NamedParameterHandler.class, null);
    NamedParameterHandler handler = (NamedParameterHandler) config.getHandler("/foo/fishy");

    assertThat(handler.getBar(), is("fishy"));
  }

  private void exceptionWasExpected() {
  }

  public static class NamedParameterHandler implements Handler {

    private String bar;

    public String getBar() {
      return bar;
    }

    public void setBar(String bar) {
      this.bar = bar;
    }

    public ResultType handle() {
      return ResultType.SUCCESS;
    }
  }
}
