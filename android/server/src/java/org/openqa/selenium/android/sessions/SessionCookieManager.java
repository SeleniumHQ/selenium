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

import android.content.Context;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**
 * A singleton class that manages all cookies defined in Android browser.
 * Maintains collection of {@link Cookie} objects.
 */
public class SessionCookieManager {
  private CookieManager cookieManager;
  private static Context context;
  private volatile static SessionCookieManager instance;
  private static final String LOG_TAG = SessionCookieManager.class.getName();
  private static final String COOKIE_DATE_FORMAT = "EEE, dd MMM yyyy hh:mm:ss z";
  
  public static final String COOKIES_SEPARATOR=";";
  
  /** Actions that are supported by Cookie Manager */
  public enum CookieActions {
    ADD, REMOVE, REMOVE_ALL, GET, GET_ALL
  }

  private SessionCookieManager(Context context) {
    CookieSyncManager.createInstance(context);
    cookieManager = CookieManager.getInstance();
  }

  /**
   * Returns a Singleton instance of SessionCookieManager class
   */
  public static SessionCookieManager getInstance() {
    if (context == null) {
      throw new RuntimeException("Class SessionCookieManager must be"
          + " initialized with createInstance() before calling getInstance()");
    }
    if (instance == null) {
      createInstance(context);
    }
    return instance;
  }

  /**
   * Create a singleton SessionCookieManager within a context
   * 
   * @param context Android context to use to access Cookies
   */
  public static void createInstance(Context context) {
    if (instance == null) {
      synchronized (SessionCookieManager.class) {
        if (instance == null) {
          SessionCookieManager.context = context;
          instance = new SessionCookieManager(context);
        }
      }
    }
  }

  /**
   * Get all cookies for given domain name
   * 
   * @param domain Domain name to fetch cookies for
   * @return Set of cookie objects for given domain
   */
  public List<Cookie> getCookies(String domain) {
    cookieManager.removeExpiredCookie();
    List<Cookie> result = new LinkedList<Cookie>();
    String cookies = cookieManager.getCookie(domain);
    if (cookies == null) {
      return result;
    }
    for (String cookie : cookies.split(COOKIES_SEPARATOR)) {
      String[] cookieValues = cookie.split("=");
      if (cookieValues.length >= 2) {
        result.add(new Cookie(cookieValues[0].trim(), cookieValues[1], domain, null, null));
      }
    }
    return result;
  }

  /**
   * Returns list of cookies for given domain as a semicolon-separated string
   * 
   * @param domain Domain name to fetch cookies for
   * @return Cookie string in form: name=value[;name=value...]
   */
  public String getCookiesAsString(String domain) {
    return cookieManager.getCookie(domain);
  }

  /**
   * Get cookie with specific name
   * 
   * @param domain Domain name to fetch cookie for
   * @param name Cookie name to search
   * @return Cookie object (if found) or null
   */
  public Cookie getCookie(String domain, String name) {
    List<Cookie> cookies = getCookies(domain);
    // No cookies for given domain
    if (cookies == null || cookies.size() == 0) {
      return null;
    }

    for (Cookie cookie : cookies)
      if (cookie.getName().equals(name)) return cookie;

    return null; // No cookie with given name
  }

  /**
   * Removes all cookies of a given domain
   * 
   * @param domain Domain name to remove all cookies for
   */
  public void removeAllCookies(String domain) {
    cookieManager.removeAllCookie();
  }

  /**
   * Remove domain cookie by name
   * 
   * @param domain Domain name to remove cookie for
   * @param name Name of the cookie to remove
   */
  public void remove(String domain, String name) {
    List<Cookie> cookies = getCookies(domain);
    for (Cookie c : cookies)
      if (c.getName().equals(name)) {
        cookies.remove(c);
        // TODO(berrada): If we're removing a cookie, why not set the time to somewhere in the past?
        cookieManager.setCookie(domain, name
            + "=; expires="
            + new SimpleDateFormat(COOKIE_DATE_FORMAT)
                .format(System.currentTimeMillis() + 500));
        break;
      }
    cookieManager.removeExpiredCookie();
  }

  /**
   * Add domain cookie
   * 
   * @param domain Domain name to add cookie to
   * @param c Cookie to be added
   */
  public void addCookie(String domain, Cookie c) {
    Log.d(LOG_TAG, "Adding cookie to domain " + domain + " ; " + cookieToString(c));
    cookieManager.setCookie(domain, cookieToString(c));
  }

  public static List<String> cookiesToString(List<Cookie> cookies) {
    List<String> setCookieList = new ArrayList<String>(cookies.size());
    for (Cookie c : cookies) {
      setCookieList.add(cookieToString(c));
    }
    return setCookieList;
  }

  public static String cookieToString(Cookie c) {
    return c.getName() + "=" + c.getValue();
  }
}
