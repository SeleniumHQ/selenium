package org.openqa.selenium.remote.http;

import org.junit.Test;

import java.nio.charset.StandardCharsets;
import java.util.logging.Level;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class DumpHttpExchangeFilterTest {

  @Test
  public void shouldIncludeRequestAndResponseHeaders() {
    DumpHttpExchangeFilter dumpFilter = new DumpHttpExchangeFilter();

    String reqLog = dumpFilter.requestLogMessage(
      new HttpRequest(GET, "/foo").addHeader("Peas", "and Sausages"));

    assertThat(reqLog).contains("Peas");
    assertThat(reqLog).contains("and Sausages");

    String resLog = dumpFilter.responseLogMessage(new HttpResponse()
      .addHeader("Cheese", "Brie")
      .setContent(string("Hello, World!", UTF_8)));

    assertThat(resLog).contains("Cheese");
    assertThat(resLog).contains("Brie");
  }

  @Test
  public void shouldIncludeRequestContentInLogMessage() {
    DumpHttpExchangeFilter dumpFilter = new DumpHttpExchangeFilter();

    String reqLog = dumpFilter.requestLogMessage(
      new HttpRequest(GET, "/foo").setContent(Contents.string("Cheese is lovely", UTF_8)));

    assertThat(reqLog).contains("Cheese is lovely");
  }

  @Test
  public void shouldIncludeResponseCodeInLogMessage() {
    DumpHttpExchangeFilter dumpFilter = new DumpHttpExchangeFilter();

    String resLog = dumpFilter.responseLogMessage(
      new HttpResponse().setStatus(505));

    assertThat(resLog).contains("505");
  }

  @Test
  public void shouldIncludeBodyOfResponseInLogMessage() {
    DumpHttpExchangeFilter dumpFilter = new DumpHttpExchangeFilter();

    String resLog = dumpFilter.responseLogMessage(
      new HttpResponse().setContent(Contents.string("Peas", UTF_8)));

    assertThat(resLog).contains("Peas");
  }
}
