package org.openqa.grid.internal.listener;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.ID;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.Header;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.DetachedRemoteProxy;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.CommandListener;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;
import org.openqa.grid.web.servlet.handler.SeleniumBasedResponse;
import org.openqa.selenium.remote.internal.HttpClientFactory;

public class CommandListenerTest {

  private static final byte[] responseBytes = new byte[] { 0, 0, 0, 0, 0 };

  static class MyRemoteProxy extends DetachedRemoteProxy implements CommandListener {

    public MyRemoteProxy(RegistrationRequest request, Registry registry) {
      super(request, registry);
    }

    @Override
    public void afterCommand(TestSession session, HttpServletRequest request, HttpServletResponse response) {
      ((SeleniumBasedResponse) response).setForwardedContent(responseBytes);
    }

    @Override
    public void beforeCommand(TestSession session, HttpServletRequest request, HttpServletResponse response) {
      // no-op
    }

    @Override
    public URL getRemoteHost() {
      try {
        return new URL("http://machine1");
      } catch (MalformedURLException e) {
        e.printStackTrace();
      }

      return null;
    }

    @Override
    public HttpClientFactory getHttpClientFactory() {
      HttpClientFactory factory = mock(HttpClientFactory.class);
      HttpClient client = mock(HttpClient.class);
      HttpResponse response = mock(HttpResponse.class);

      StatusLine line = mock(StatusLine.class);
      when(line.getStatusCode()).thenReturn(200);
      when(response.getStatusLine()).thenReturn(line);
      when(response.getAllHeaders()).thenReturn(new Header[0]);

      try {
        when(client.execute(any(HttpHost.class), any(HttpRequest.class))).thenReturn(response);
      } catch (Exception e) {
        e.printStackTrace();
      }
      when(factory.getGridHttpClient(anyInt(), anyInt())).thenReturn(client);
      return factory;
    }
  }

  static RegistrationRequest req = null;
  static Map<String, Object> app1 = new HashMap<>();

  @BeforeClass
  public static void prepare() {
    app1.put(APP, "app1");
    Map<String, Object> config = new HashMap<>();
    config.put(ID, "abc");
    req = new RegistrationRequest();
    req.addDesiredCapability(app1);
    req.setConfiguration(config);
  }

  @Test
  public void canModifyResponseWithListener() throws IOException {
    Registry registry = Registry.newInstance();
    registry.add(new MyRemoteProxy(req, registry));

    RequestHandler req = GridHelper.createNewSessionHandler(registry, app1);
    req.process();
    TestSession session = req.getSession();

    SeleniumBasedRequest request = mock(SeleniumBasedRequest.class);
    when(request.getRequestURI()).thenReturn("session");
    when(request.getServletPath()).thenReturn("session");
    when(request.getContextPath()).thenReturn("");
    when(request.getMethod()).thenReturn("GET");

    Enumeration<String> strings = Collections.emptyEnumeration();
    when(request.getHeaderNames()).thenReturn(strings);

    HttpServletResponse response = mock(HttpServletResponse.class);
    ServletOutputStream stream = mock(ServletOutputStream.class);
    when(response.getOutputStream()).thenReturn(stream);

    session.forward(request, response, true);

    verify(stream).write(responseBytes);
  }
}
