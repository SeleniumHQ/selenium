package org.openqa.grid.web.servlet.handler;

import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

public class SeleniumBasedResponse extends HttpServletResponseWrapper {

  private byte[] forwardedContent = null;
  private final String encoding = "UTF-8";

  public SeleniumBasedResponse(HttpServletResponse response) {
    super(response);
  }

  public String getForwardedContent() {
    if (forwardedContent == null){
      return null;
    }
    Charset charset = Charset.forName(encoding);
    CharsetDecoder decoder = charset.newDecoder();
    CharBuffer cbuf = null;
    try {
      cbuf = decoder.decode(ByteBuffer.wrap(forwardedContent));
    } catch (CharacterCodingException e) {
      // ignore
    }
    return cbuf.toString();
  }

  public void setForwardedContent(byte[] forwardedContent) {
    this.forwardedContent = forwardedContent;
  }

}
