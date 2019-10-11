package org.openqa.selenium.support.devtools;

import com.google.common.net.MediaType;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.environment.webserver.JreAppServer;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.testing.Safely.safelyCall;

public class NetworkInterceptorTest {

  private JreAppServer appServer;
  private WebDriver driver;
  private NetworkInterceptor interceptor;

  @Before
  public void setup() {
    appServer = new JreAppServer()
      .setHandler(req -> new HttpResponse()
        .setStatus(200)
        .addHeader("Content-Type", MediaType.XHTML_UTF_8.toString())
        .setContent(utf8String("<html><head><title>Hello, World!</title></head><body/></html>")));
    appServer.start();

    driver = new WebDriverBuilder().get();

    assumeThat(driver).isInstanceOf(HasDevTools.class);
  }

  @After
  public void tearDown() {
    safelyCall(
      () -> interceptor.close(),
      () -> driver.quit(),
      () -> appServer.stop());
  }

  @Test
  public void shouldProceedAsNormalIfRequestIsNotIntercepted() {
    interceptor = new NetworkInterceptor(
      driver,
      Route.matching(req -> false).to(() -> req -> new HttpResponse()));

    driver.get(appServer.whereIs("/cheese"));

    String source = driver.getPageSource();

    assertThat(source).contains("Hello, World!");
  }

  @Test
  public void shouldAllowTheInterceptorToChangeTheResponse() {
    interceptor = new NetworkInterceptor(
      driver,
      Route.matching(req -> true)
        .to(() -> req -> new HttpResponse()
          .setStatus(200)
          .addHeader("Content-Type", MediaType.HTML_UTF_8.toString())
          .setContent(utf8String("Creamy, delicious cheese!"))));

    driver.get(appServer.whereIs("/cheese"));

    String source = driver.getPageSource();

    assertThat(source).contains("delicious cheese!");
  }

  @Test
  public void shouldBeAbleToReturnAMagicResponseThatCausesTheOriginalRequestToProceeed() {
    AtomicBoolean seen = new AtomicBoolean(false);

    interceptor = new NetworkInterceptor(
      driver,
      Route.matching(req -> true).to(() -> req -> {
        seen.set(true);
        return NetworkInterceptor.PROCEED_WITH_REQUEST;
      }));

    driver.get(appServer.whereIs("/cheese"));

    String source = driver.getPageSource();

    assertThat(seen.get()).isTrue();
    assertThat(source).contains("Hello, World!");
  }
}
