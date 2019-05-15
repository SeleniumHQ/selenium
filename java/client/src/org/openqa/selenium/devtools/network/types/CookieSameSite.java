package org.openqa.selenium.devtools.network.types;

/**
 * Represents the cookie's 'SameSite' status: https://tools.ietf.org/html/draft-west-first-party-cookies
 */
public enum CookieSameSite {

  Strict("Strict"),
  Lax("Lax"),
  Extended("Extended"),
  None("None");

  private String status;

  CookieSameSite(String status) {
    this.status = status;
  }

  public String getStatus() {
    return status;
  }

}
