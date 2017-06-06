package org.openqa.selenium.remote.server;

import com.google.common.base.Preconditions;
import com.google.common.io.ByteStreams;

import org.openqa.selenium.remote.http.HttpResponse;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.http.HttpServletResponse;

class ServletResponseWrappingHttpResponse extends HttpResponse {

  private final HttpServletResponse resp;

  public ServletResponseWrappingHttpResponse(HttpServletResponse resp) {
    this.resp = Preconditions.checkNotNull(resp, "Response to wrap must not be null");
  }

  @Override
  public int getStatus() {
    return resp.getStatus();
  }

  @Override
  public void setStatus(int status) {
    resp.setStatus(status);
  }

  @Override
  public Iterable<String> getHeaderNames() {
    return resp.getHeaderNames();
  }

  @Override
  public Iterable<String> getHeaders(String name) {
    return resp.getHeaders(name);
  }

  @Override
  public String getHeader(String name) {
    return resp.getHeader(name);
  }

  @Override
  public void setHeader(String name, String value) {
    resp.setHeader(name, value);
  }

  @Override
  public void addHeader(String name, String value) {
    resp.addHeader(name, value);
  }

  @Override
  public void removeHeader(String name) {
    throw new UnsupportedOperationException("removeHeader");
  }

  @Override
  public void setContent(byte[] data) {
    resp.setContentLength(data.length);
    setContent(new ByteArrayInputStream(data));
  }

  @Override
  public void setContent(InputStream toStreamFrom) {
    try (OutputStream buffered = resp.getOutputStream()) {
      ByteStreams.copy(toStreamFrom, buffered);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public byte[] getContent() {
    throw new UnsupportedOperationException("getContent");
  }

  @Override
  public String getContentString() {
    throw new UnsupportedOperationException("getContentString");
  }

  @Override
  public InputStream consumeContentStream() {
    throw new UnsupportedOperationException("consumeContentStream");
  }
}
