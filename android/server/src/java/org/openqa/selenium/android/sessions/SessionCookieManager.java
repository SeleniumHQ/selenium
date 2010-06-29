/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.android.sessions;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriverException;

import android.content.Context;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;

import java.net.MalformedURLException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**
 * Class that manages cookies the webview.
 */
public class SessionCookieManager {
  private static final String LOG_TAG = SessionCookieManager.class.getName();
  private static final String COOKIE_DATE_FORMAT = "EEE, dd MMM yyyy hh:mm:ss z";

  public static final String COOKIE_SEPARATOR = ";";

  private CookieManager cookieManager;

  public SessionCookieManager(Context context) {
    // Needs to be called before CookieMAnager::getInstance()
    CookieSyncManager.createInstance(context);
    cookieManager = CookieManager.getInstance();
  }

  /**
   * Gets all cookies for a given domain name
   * 
   * @param domain Domain name to fetch cookies for
   * @return Set of cookie objects for given domain
   */
  public List<Cookie> getCookies(String domain) {
    Log.d(LOG_TAG, String.format("Get all cookies for url: %s", domain));
    cookieManager.removeExpiredCookie();
    String cookies = cookieManager.getCookie(domain);
    List<Cookie> result = new LinkedList<Cookie>();
    if (cookies == null) {
      return result;
    }
    for (String cookie : cookies.split(COOKIE_SEPARATOR)) {
      String[] cookieValues = cookie.split("=");
      if (cookieValues.length >= 2) {
        result.add(new Cookie(cookieValues[0].trim(), cookieValues[1], domain, null, null));
      }
    }
    return result;
  }
  
  /**
   * Gets all cookies associated to a URL.
   * 
   * @param url
   * @return A string containing comma separated cookies
   */
  public String getAllCookiesAsString(String url) {
    StringBuilder cookiesBuilder = new StringBuilder();
    boolean first = true;
    List<String> domains;
    try {
      domains = getDomainsFromUrl(new URL(url));
    } catch (MalformedURLException e) {
      throw new WebDriverException("Error while adding cookie. " + e);
    }
    for (String domain : domains) {
      String cookies = cookieManager.getCookie(domain);
      Log.d(LOG_TAG, "Cookie for domain " + domain + " " + cookies);
      if (cookies != null && cookies.length() > 0) {
        if (!first) {
          cookiesBuilder.append(COOKIE_SEPARATOR);
        } else {
          first = false;
        }
        cookiesBuilder.append(cookies);
      }
    }
    return cookiesBuilder.toString();
  }

  /**
   * Gets the list of domains associated to a URL.
   * 
   * @param url
   * @return List of domains as strings
   */
  private List<String> getDomainsFromUrl(URL url) {
    String host = url.getHost();
    String[] paths = new String[] {};
    if (url.getPath() != null) {
      paths = url.getPath().split("/");
    }
    List<String> domains = new ArrayList<String>(paths.length + 1);
    StringBuilder relative = new StringBuilder().append("http://").append(host).append("/");
    domains.add(relative.toString());
    for (String path : paths) {
      if (path.length() > 0) {
        relative.append(path).append("/");
        domains.add(relative.toString());
      }
    }
    Log.d(LOG_TAG, "Cookie for domains " + domains);
    return domains;
  }

  /**
   * Gets a cookie with specific name for a URL.
   * 
   * @param url
   * @param name Cookie name to search
   * @return Cookie object (if found) or null
   */
  public Cookie getCookie(String url, String name) {
    Log.d(LOG_TAG, String.format("Get cookie with name: %s, for url: %s", name, url));
    List<Cookie> cookies;
    try {
      cookies = getCookies(getDomainsFromUrl(new URL(url)).get(0));
    } catch (MalformedURLException e) {
      throw new WebDriverException("Error while adding cookie. " + e);
    }
    // No cookies for given domain
    if (cookies == null || cookies.size() == 0) {
      return null;
    }
    for (Cookie cookie : cookies)
      if (cookie.getName().equals(name)) {
        return cookie;
      }
    return null; // No cookie with given name
  }

  /**
   * Removes all cookies for a given URL.
   * 
   * @param url to remove all the cookies for
   */
  public void removeAllCookies(String url) {
    // TODO(berrada): this removes all cookies, we should remove only cookies for
    // the current URL. Given that this is single session it is ok for now.
    Log.d(LOG_TAG, String.format("Removing all cookies for url: %s", url));
    cookieManager.removeAllCookie();
  }

  /**
   * Removes cookie by name for a URL.
   * 
   * @param url to remove cookie for
   * @param name of the cookie to remove
   */
  public void remove(String url, String name) {
    Log.d(LOG_TAG, String.format("Removing cookie with name: %s for url: %s", name, url));
    List<String> domains;
    try {
      domains = getDomainsFromUrl(new URL(url));
    } catch (MalformedURLException e) {
      throw new WebDriverException("Error while adding cookie. " + e);
    }
    for (String domain : domains) {
    List<Cookie> cookies = getCookies(domain);
    for (Cookie c : cookies) {
      if (c.getName().equals(name)) {
        cookies.remove(c);
        // To remove a cookie we set the date somewhere in the past.
        cookieManager.setCookie(domain, String.format("%s=; expires=%s", name,
            new SimpleDateFormat(COOKIE_DATE_FORMAT).format(System.currentTimeMillis() - 500)));
        break;
      }
    }
    }
    cookieManager.removeExpiredCookie();
  }

  /**
   * Adds a cookie to a URL domain.
   * 
   * @param url to add the cookie to
   * @param cookie Cookie to be added
   */
  public void addCookie(String url, Cookie cookie) {
    Log.d(LOG_TAG, String.format("Adding cookie: %s to url: %s", cookie.toString(), url));
    URL urlObj;
    try {
      urlObj = new URL(url);
    } catch (MalformedURLException e) {
      throw new WebDriverException("Error while adding cookie. ", e);
    }
    String domain = "http://" + urlObj.getHost() + cookie.getPath();
    if (!domain.endsWith("/")) {
      domain = domain + "/";
    }
    cookieManager.setCookie(domain, stringifyCookie(cookie));
  }
  
  private String stringifyCookie(Cookie cookie) {
    return String.format("%s=%s", cookie.getName(), cookie.getValue());
  }
}
