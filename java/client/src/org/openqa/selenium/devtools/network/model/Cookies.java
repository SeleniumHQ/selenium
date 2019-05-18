package org.openqa.selenium.devtools.network.model;

import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by aohana
 */
public class Cookies {

  private List<Cookie> cookies;

  private Cookies(List<Cookie> cookies) {
    this.cookies = cookies;
  }

  private static Cookies fromJson(JsonInput input) {

    List<Cookie> cookiesList = new ArrayList<>();

    input.beginArray();

    while (input.hasNext()) {
      cookiesList.add(Cookie.parseCookie(input));
    }

    input.endArray();

    return new Cookies(cookiesList);
  }

  public List<org.openqa.selenium.Cookie> asSeleniumCookies() {
    List<org.openqa.selenium.Cookie> seleniumCookies = new ArrayList<>();
    for (Cookie cookie : cookies) {
      seleniumCookies.add(cookie.asSeleniumCookie());
    }
    return seleniumCookies;
  }

}
