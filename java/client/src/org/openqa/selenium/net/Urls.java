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


package org.openqa.selenium.net;

import org.openqa.selenium.WebDriverException;

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.logging.Logger;

public class Urls {
  private static Logger log = Logger.getLogger(Urls.class.getName());

  /**
   * Strips the specified URL so it only includes a protocal, hostname and port
   * 
   * @throws java.net.MalformedURLException
   */
  public static String toProtocolHostAndPort(String url) {
    try {
      URL u = new URL(url);
      String path = u.getPath();
      if (path != null && !"".equals(path) && !path.endsWith("/")) {
        log.warning("It looks like your baseUrl (" +
            url
            +
            ") is pointing to a file, not a directory (it doesn't end with a /).  We're going to have to strip off the last part of the pathname.");
      }
      return u.getProtocol() + "://" + u.getAuthority();
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Encodes the text as an URL using UTF-8.
   * 
   * @param value the text too encode
   * @return the encoded URI string
   * @see URLEncoder#encode(java.lang.String, java.lang.String)
   */
  public static String urlEncode(String value) {
    try {
      return URLEncoder.encode(value, "UTF-8");
    } catch (UnsupportedEncodingException e) {
      throw new WebDriverException(e);
    }
  }
}
