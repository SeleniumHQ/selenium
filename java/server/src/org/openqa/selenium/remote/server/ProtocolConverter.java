package org.openqa.selenium.remote.server;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableSet;
import com.google.common.io.ByteSource;
import com.google.common.io.ByteStreams;

import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandCodec;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.ResponseCodec;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.internal.ApacheHttpClient;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ProtocolConverter implements SessionCodec {

  private final static ImmutableSet<String> IGNORED_REQ_HEADERS = ImmutableSet.<String>builder()
      .add("connection")
      .add("keep-alive")
      .add("proxy-authorization")
      .add("proxy-authenticate")
      .add("proxy-connection")
      .add("te")
      .add("trailer")
      .add("transfer-encoding")
      .add("upgrade")
      .build();

  private final HttpClient client;
  private final CommandCodec<HttpRequest> downstream;
  private final CommandCodec<HttpRequest> upstream;
  private final ResponseCodec<HttpResponse> downstreamResponse;
  private final ResponseCodec<HttpResponse> upstreamResponse;

  public ProtocolConverter(
      URL upstreamUrl,
      CommandCodec<HttpRequest> downstream,
      ResponseCodec<HttpResponse> downstreamResponse,
      CommandCodec<HttpRequest> upstream,
      ResponseCodec<HttpResponse> upstreamResponse) {
    this.downstream = downstream;
    this.upstream = upstream;
    this.downstreamResponse = downstreamResponse;
    this.upstreamResponse = upstreamResponse;

    client = new ApacheHttpClient.Factory().createClient(upstreamUrl);
  }

  @Override
  public void handle(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    HttpRequest fromDownstream = createRequest(req);

    Command command = downstream.decode(fromDownstream);
    HttpRequest request = upstream.encode(command);

    HttpResponse res = makeRequest(request);

    Response decoded = upstreamResponse.decode(res);
    HttpResponse response = downstreamResponse.encode(decoded);

    copyToServletResponse(response, resp);
  }

  @VisibleForTesting
  HttpResponse makeRequest(HttpRequest request) throws IOException {
    return client.execute(request, true);
  }

  private void copyToServletResponse(HttpResponse response, HttpServletResponse resp)
      throws IOException {
    resp.setStatus(response.getStatus());

    for (String name : response.getHeaderNames()) {
      if (IGNORED_REQ_HEADERS.contains(name.toLowerCase())) {
        continue;
      }

      for (String value : response.getHeaders(name)) {
        resp.addHeader(name, value);
      }
    }

    try (OutputStream out = resp.getOutputStream()) {
      ByteSource.wrap(response.getContent()).copyTo(out);
    }
  }

  private HttpRequest createRequest(HttpServletRequest req) throws IOException {
    HttpMethod method = HttpMethod.valueOf(req.getMethod().toUpperCase());
    String url = req.getPathInfo();
    if (Strings.isNullOrEmpty(url)) {
      url = "/";
    }
    HttpRequest request = new HttpRequest(method, url);

    Enumeration<String> names = req.getHeaderNames();
    while (names.hasMoreElements()) {
      String name = names.nextElement();

      if (name == null || IGNORED_REQ_HEADERS.contains(name.toLowerCase())) {
        continue;
      }

      Enumeration<String> values = req.getHeaders(name);
      while (values.hasMoreElements()) {
        String value = values.nextElement();
        if (value != null) {
          request.addHeader(name, value);
        }
      }
    }

    try (InputStream in = req.getInputStream();
         ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      ByteStreams.copy(in, out);
      request.setContent(out.toByteArray());
    }

    return request;
  }
}
