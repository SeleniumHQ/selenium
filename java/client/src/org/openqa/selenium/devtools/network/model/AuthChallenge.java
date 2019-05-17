package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

public class AuthChallenge {

  /**
   * Origin of the challenger.
   */
  private String origin;
  /**
   * The realm of the challenge. May be empty.
   */
  private String realm;
  /**
   * The authentication scheme used, such as basic or digest
   */
  private String scheme;
  /**
   * Source of the authentication challenge.
   * Optional
   */
  private Source source;

  public static AuthChallenge parseRequest(JsonInput input) {
    AuthChallenge authChallenge = new AuthChallenge();
    input.beginObject();
    while (input.hasNext()){
      switch (input.nextName()) {
        case "origin" :
          authChallenge.setOrigin(input.nextString());
          break;
        case "realm" :
          authChallenge.setRealm(input.nextString());
          break;
        case "scheme" :
          authChallenge.setScheme(input.nextString());
          break;
        case "source" :
          authChallenge.setSource(Source.getSource(input.nextString()));
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return authChallenge;
  }


  public String getScheme() {
    return scheme;
  }

  private void setScheme(String scheme) {
    requireNonNull(origin, "'scheme' is mandatory for AuthChallenge");
    this.scheme = scheme;
  }

  public String getOrigin() {
    return origin;
  }

  public void setOrigin(String origin) {
    requireNonNull(origin, "'origin' is mandatory for AuthChallenge");
    this.origin = origin;
  }

  public String getRealm() {
    return realm;
  }

  private void setRealm(String realm) {
    requireNonNull(origin, "'realm' is mandatory for AuthChallenge");
    this.realm = realm;
  }

  public Source getSource() {
    return source;
  }

  public void setSource(Source source) {
    this.source = source;
  }
}
