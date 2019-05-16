package org.openqa.selenium.devtools.network.types;

/**
 * Represents the cookie's 'SameSite' status: https://tools.ietf.org/html/draft-west-first-party-cookies
 */
public enum CookieSameSite {

  Strict,
  Lax,
  Extended,
  None

}
