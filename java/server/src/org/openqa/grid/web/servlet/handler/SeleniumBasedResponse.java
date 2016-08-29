// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


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
    if (forwardedContent == null) {
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

  public byte[] getForwardedContentAsByteArray() {
    return forwardedContent;
  }
}
