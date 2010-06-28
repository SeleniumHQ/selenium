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

package org.openqa.selenium.android.intents;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.android.intents.IntentReceiver.IntentReceiverListener;
import org.openqa.selenium.android.sessions.SessionCookieManager;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 * Intent receiver for handling cookie-related requests. Passes the request to
 * the {@link SessionCookieManager} to be processed.
 */
public class CookieIntentReceiver extends BroadcastReceiver {
  private IntentReceiverListener listener;
  private static final String LOG_TAG = CookieIntentReceiver.class.getName();

  public void setListener(IntentReceiverListener listener) {
    this.listener = listener;
  }

  public void removeListener(IntentReceiverListener listener) {
    if (listener == this.listener) {
      this.listener = null;
    }
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());
    Bundle bundle = intent.getExtras();
    String action = intent.getAction();
    if (action == null || action.length() <= 0) {
      Log.e(LOG_TAG, "Action cannot be empty for cookie intent: " + intent.toString());
      return;
    }
    String fullUrl = (String) listener.onReceiveBroadcast(Action.GET_URL);
    URL url = null;
    try {
      url = new URL(fullUrl);
    } catch (MalformedURLException e) {
      throw new WebDriverException("Internal error in cookie intent receiver."
          + "Cannot parse URL: " + url);
    }
    
    String result = doAction(action, intent.getExtras(), url);

    // Returning the result
    Log.d(LOG_TAG, "Cookie " + result);
    Bundle res = new Bundle();
    res.putString(action, result);
    this.setResultExtras(res);
  }

  protected String doAction(String action, Bundle extras, URL url) {
    String[] args = null;
    if ((extras != null) && (extras.size() > 0)) {
      args = new String[extras.size()];
      int index = 0;
      for (String key : extras.keySet()) {
        if (extras.getSerializable(key) != null) {
          args[index] = (String) extras.getSerializable(key);
          index ++;
        }
      }
      if (args.length != 3) {
        throw new WebDriverException("Internal error in cookie intent receiver." +
                "Missing arguments! " + args.toString());
      }
    }
    
    List<String> domains = getDomains(url);
    if (action.equals(Action.GET_COOKIE)) {
      return getCookie(domains.get(0), args[0]);
    } else if (action.equals(Action.REMOVE_ALL_COOKIES)) {
      removeCookies(domains);
    } else if (action.equals(Action.GET_ALL_COOKIES)) {
      return getCookies(domains);
    } else if (action.equals(Action.REMOVE_COOKIE)) {
      removeCookie(domains, args[0]);
    } else if (action.equals(Action.ADD_COOKIE)) {
      addCookie(args[0], args[1], url.getHost(), args[2]);
    }
    return "";
  }

  /*
   * There are 3 major var for cookies: domain, path, name CookieManager stores
   * it like map where key is domain+path and value is cookieName=cookieValue
   */
  protected List<String> getDomains(URL url) {
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

  protected String getCookie(String domain, String name) {
    Cookie cookie = SessionCookieManager.getInstance().getCookie(domain, name);
    return (cookie == null) ? "" : cookie.getValue();
  }

  protected String getCookies(List<String> domains) {
    StringBuilder b = new StringBuilder();
    boolean first = true;
    for (String domain : domains) {
      String cookies = SessionCookieManager.getInstance().getCookiesAsString(domain);
      Log.d(LOG_TAG, "Cookie for domain " + domain + " " + cookies);
      if (cookies != null && cookies.length() > 0) {
        if (!first) {
          b.append(SessionCookieManager.COOKIES_SEPARATOR);
        } else {
          first = false;
        }
        b.append(cookies);
      }
    }
    return b.toString();
  }

  protected void removeCookies(List<String> domains) {
    for (String domain : domains) {
      SessionCookieManager.getInstance().removeAllCookies(domain);
    }
  }

  protected void removeCookie(List<String> domains, String name) {
    for (String domain : domains) {
      SessionCookieManager.getInstance().remove(domain, name);
    }
  }

  protected void addCookie(String name, String value, String host, String path) {
    String d = "http://" + host + path;
    if (!d.endsWith("/")) {
      d = d + "/";
    }
    SessionCookieManager.getInstance().addCookie(d, new Cookie(name, value, null, null, null));
  }
}
