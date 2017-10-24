package org.openqa.selenium.remote.server;

import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;

import javax.servlet.http.HttpServletRequest;

/**
 * Read-only adapter of {@link HttpServletRequest} to a {@link HttpRequest}. This class is not
 * thread-safe, and you can only expect to read the content once.
 */
class ServletRequestWrappingHttpRequest extends HttpRequest {

  private final HttpServletRequest req;

  public ServletRequestWrappingHttpRequest(HttpServletRequest req) {
    super(HttpMethod.valueOf(req.getMethod()), req.getPathInfo() == null ? "/" : req.getPathInfo());

    this.req = req;
  }

  @Override
  public Iterable<String> getHeaderNames() {
    return Collections.list(req.getHeaderNames());
  }

  @Override
  public Iterable<String> getHeaders(String name) {
    return Collections.list(req.getHeaders(name));
  }

  @Override
  public String getHeader(String name) {
    return req.getHeader(name);
  }


  @Override
  public void removeHeader(String name) {
    throw new UnsupportedOperationException("removeHeader");
  }

  @Override
  public void setHeader(String name, String value) {
    throw new UnsupportedOperationException("setHeader");
  }

  @Override
  public void addHeader(String name, String value) {
    throw new UnsupportedOperationException("addHeader");
  }

  @Override
  public void setContent(byte[] data) {
    throw new UnsupportedOperationException("setContent");
  }

  @Override
  public void setContent(InputStream toStreamFrom) {
    throw new UnsupportedOperationException("setContent");
  }

  @Override
  public InputStream consumeContentStream() {
    try {
      return req.getInputStream();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
}
