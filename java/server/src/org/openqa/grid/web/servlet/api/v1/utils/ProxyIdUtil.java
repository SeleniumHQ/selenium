/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package org.openqa.grid.web.servlet.api.v1.utils;

import com.sun.org.apache.xml.internal.security.exceptions.Base64DecodingException;

import org.webbitserver.helpers.Base64;

import java.io.UnsupportedEncodingException;

public class ProxyIdUtil {

  public static final String UTF_8 = "UTF-8";

  public static String encodeId(String input) throws UnsupportedEncodingException {
    String base64ProxyUrl =  Base64.encode(input.getBytes());
    return base64ProxyUrl;
  }

  public static String decodeId(String base64EncodedString)
      throws Base64DecodingException {
    return new String(Base64.decode(base64EncodedString));
  }

}
