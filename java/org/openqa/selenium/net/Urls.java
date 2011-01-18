
package org.openqa.selenium.net;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.NullTrace;
import org.openqa.selenium.internal.Trace;

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;

public class Urls {
  private static Trace log = new NullTrace();

  /**
   * Strips the specified URL so it only includes a protocal, hostname and
   * port
   *
   * @throws java.net.MalformedURLException
   */
  public static String toProtocolHostAndPort(String url) {
    try {
      URL u = new URL(url);
      String path = u.getPath();
      if (path != null && !"".equals(path) && !path.endsWith("/")) {
        log.warn("It looks like your baseUrl (" + url
                 + ") is pointing to a file, not a directory (it doesn't end with a /).  We're going to have to strip off the last part of the pathname.");
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
