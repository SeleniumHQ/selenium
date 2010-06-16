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
import org.openqa.selenium.android.intents.IntentBroadcasterWithResultReceiver.BroadcasterWithResultListener;
import org.openqa.selenium.android.sessions.SessionCookieManager;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Intent receiver for handling cookie-related requests. Passes the request to
 * the {@link SessionCookieManager} to be processed.
 */
public class CookieIntentReceiver extends BroadcastReceiver {
  private BroadcasterWithResultListener listener;
  private static final String LOG_TAG = CookieIntentReceiver.class.getName();

  public void setListener(BroadcasterWithResultListener listener) {
    this.listener = listener;
  }

  public void removeListener(BroadcasterWithResultListener listener) {
    if (listener == this.listener) {
      this.listener = null;
    }
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());

    Bundle bundle = intent.getExtras();
    String action = bundle.getString(BundleKey.ACTION);
    if (action == null || action.length() <= 0) {
      Log.e(LOG_TAG, "Action cannot be empty for intent: " + intent.toString());
      return;
    }
    String fullUrl = listener.onBroadcastWithResult(Action.GET_URL);
    URL url;
    try {
      url = new URL(fullUrl);
    } catch (MalformedURLException e) {
      Log.e(LOG_TAG, "Cannot parse url", e);
      Bundle res = new Bundle();
      res.putString(BundleKey.RESULT, "Error");
      this.setResultExtras(res);
      return;
    }

    Map<String, Object> args = getParameters(intent);
    Log.d(LOG_TAG, "Action: " + action
        + ", args #: " + args.size() + ((args.size() > 0) ? ", arguments : " + args : ""));
    String result = "";
    SessionCookieManager cookieManager = SessionCookieManager.getInstance();
    String host = url.getHost();
    List<String> domains = getDomains(url);
    LocalContext c = new LocalContext();
    c.setArgs(args);
    c.setCookieManager(cookieManager);
    c.setDomains(domains);
    c.setHost(host);
    c.setUrl(url);

    result = doAction(SessionCookieManager.CookieActions.valueOf(action), c);

    // Returning the result
    Log.d(LOG_TAG, "Cookie " + result);
    Bundle res = new Bundle();
    res.putString(BundleKey.RESULT, result);
    this.setResultExtras(res);
  }

  protected String doAction(SessionCookieManager.CookieActions action, LocalContext c) {
    switch (action) {
      case GET:
        return getCookie(c);
      case REMOVE_ALL:
        return removeCookies(c);
      case GET_ALL:
        return getCookies(c);
      case REMOVE:
        return removeCookie(c);
      case ADD:
        return addCookie(c);
      default:
        return "";
    }
  }

  protected Map<String, Object> getParameters(Intent intent) {
    Map<String, Object> args = new HashMap<String, Object>();
    if (intent.getExtras() != null && intent.getExtras().size() > 3) {
      int argCount = 0;
      for (String key : intent.getExtras().keySet()) {
        if (!key.equals(BundleKey.ACTION))
          args.put(key, intent.getExtras().get(key));
      }
    }
    return args;
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

  protected String getCookie(LocalContext c) {
    Cookie cookie = c.getCookieManager().getCookie(c.getDomains().get(0),
        (String) c.getArgs().get(CookiesIntent.NAME_PARAM));
    return (cookie == null) ? "" : cookie.getValue();
  }

  protected String getCookies(LocalContext c) {
    StringBuilder b = new StringBuilder();
    boolean first = true;
    for (String domain : c.getDomains()) {
      String cookies = c.getCookieManager().getCookiesAsString(domain);
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

  protected String removeCookies(LocalContext c) {
    String result = "";
    for (String domain : c.getDomains()) {
      c.getCookieManager().removeAllCookies(domain);
    }
    return result;
  }

  protected String removeCookie(LocalContext c) {
    String result = "";
    for (String domain : c.getDomains()) {
      c.getCookieManager().remove(domain, (String) c.getArgs().get(CookiesIntent.NAME_PARAM));
    }
    return result;
  }

  protected String addCookie(LocalContext c) {
    String result = "";
    String d = "http://" + c.getHost() + (String) c.getArgs().get(CookiesIntent.PATH_PARAM);
    if (!d.endsWith("/")) {
      d = d + "/";
    }
    c.getCookieManager().addCookie(
        d, new Cookie((String) c.getArgs().get(CookiesIntent.NAME_PARAM),
            (String) c.getArgs().get(CookiesIntent.VALUE_PARAM), null, null, null));
    return result;
  }


  public static class LocalContext {
    private URL url;
    private String host;
    private List<String> domains;
    private SessionCookieManager cookieManager;
    private Map<String, Object> args;

    public URL getUrl() {
      return url;
    }

    public void setUrl(URL url) {
      this.url = url;
    }

    public String getHost() {
      return host;
    }

    public void setHost(String host) {
      this.host = host;
    }

    public List<String> getDomains() {
      return domains;
    }

    public void setDomains(List<String> domains) {
      this.domains = domains;
    }

    public SessionCookieManager getCookieManager() {
      return cookieManager;
    }

    public void setCookieManager(SessionCookieManager cookieManager) {
      this.cookieManager = cookieManager;
    }

    public Map<String, Object> getArgs() {
      return args;
    }

    public void setArgs(Map<String, Object> args) {
      this.args = args;
    }
  }
}
