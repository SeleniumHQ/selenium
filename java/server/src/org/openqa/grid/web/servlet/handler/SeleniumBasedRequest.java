package org.openqa.grid.web.servlet.handler;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import org.apache.commons.io.IOUtils;
import org.openqa.grid.common.SeleniumProtocol;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;

import com.google.common.annotations.VisibleForTesting;

/**
 * wrapper around a selenium http request that helps accessing the internal 
 * details that are selenium related ( type of protocol, new session request
 * etc ) Also allows to change the content of the request, or read it 
 * on the hub.
 * 
 */
public abstract class SeleniumBasedRequest extends HttpServletRequestWrapper {

  private byte[] body;
  private final Registry registry;
  private final RequestType type;
  private final String encoding = "UTF-8";
  private final Map<String, Object> desiredCapability;
  private final long timestamp = System.currentTimeMillis();


  public static SeleniumBasedRequest createFromRequest(HttpServletRequest request, Registry registry) {
    if (SeleniumBasedRequest.getRequestProtocol(request) == SeleniumProtocol.Selenium) {
      return new LegacySeleniumRequest(request, registry);
    } else {
      return new WebDriverRequest(request, registry);
    }
  }


  /**
   * check the request and finds out if that's a selenium legacy protocol( RC ) or a webdriver one.
   * @param request
   * @return
   */
  public static SeleniumProtocol getRequestProtocol(HttpServletRequest request) {
    if ("/selenium-server/driver".equals(request.getServletPath())) {
      return SeleniumProtocol.Selenium;
    } else {
      return SeleniumProtocol.WebDriver;
    }
  }

  @VisibleForTesting
  public SeleniumBasedRequest(HttpServletRequest request, Registry registry, RequestType type,
      Map<String, Object> desiredCapability) {
    super(request);
    this.registry = registry;
    this.type = type;
    this.desiredCapability = desiredCapability;
  }

  public SeleniumBasedRequest(HttpServletRequest httpServletRequest, Registry registry) {
    super(httpServletRequest);
    try {
      InputStream is = super.getInputStream();
      body = IOUtils.toByteArray(is);
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }
    this.registry = registry;
    type = extractRequestType();

    if (type == RequestType.START_SESSION) {
      desiredCapability = extractDesiredCapability();
    } else {
      desiredCapability = null;
    }
  }

  public Registry getRegistry() {
    return registry;
  }

  /**
   * @return the type of the request.
   */
  public abstract RequestType extractRequestType();

  /**
   * Extract the session from the request. This only works for a request that has a session already
   * assigned. It shouldn't be called for a new session request.
   *
   * @return the external session id sent by the remote. Null is the session cannot be found.
   */
  public abstract ExternalSessionKey extractSession();

  /**
   * Parse the request to extract the desiredCapabilities. For non web driver protocol ( selenium1 )
   * some mapping will be necessary
   *
   * @return the desired capabilities requested by the client.
   */
  public abstract Map<String, Object> extractDesiredCapability();


  // TODO freynaud remove the TestSession parameter.The listener can modify the 
  // original request instead.
  public abstract String getNewSessionRequestedCapability(TestSession session);



  public RequestType getRequestType() {
    return type;
  }

  @Override
  public ServletInputStream getInputStream() throws IOException {
    return new ServletInputStreamImpl(new ByteArrayInputStream(body));
  }

  @Override
  public BufferedReader getReader() throws IOException {
    return new BufferedReader(new InputStreamReader(getInputStream(), encoding));
  }

  public String getBody() {
    try {
      Charset charset = Charset.forName(encoding);
      CharsetDecoder decoder = charset.newDecoder();
      CharBuffer cbuf = decoder.decode(ByteBuffer.wrap(body));
      return new String(cbuf.toString());
    } catch (CharacterCodingException e) {
      e.printStackTrace();
    }
    return null;
  }

  public void setBody(String content) {
    body = content.getBytes();
  }

  public long getCreationTime(){
    return timestamp;
  }


  public String toString() {
    SimpleDateFormat format = new SimpleDateFormat("d MMM yyyy HH:mm:ss");
    StringBuilder builder = new StringBuilder();
    builder.append("["+format.format(new Date(timestamp))+"] ");
    builder.append(getMethod().toUpperCase() +" "+getPathInfo()+"   ");
    if (getBody() != null && !getBody().isEmpty()) {
      builder.append(getBody());
    }
    return builder.toString();
  }

  public Map<String, Object> getDesiredCapabilities() {
    return desiredCapability;
  }

  private class ServletInputStreamImpl extends ServletInputStream {

    private InputStream is;

    public ServletInputStreamImpl(InputStream is) {
      this.is = is;
    }

    public int read() throws IOException {
      return is.read();
    }

    public boolean markSupported() {
      return false;
    }

    public synchronized void mark(int i) {
      throw new RuntimeException("not implemented");
    }

    public synchronized void reset() throws IOException {
      throw new RuntimeException("not implemented");
    }
  }



}
