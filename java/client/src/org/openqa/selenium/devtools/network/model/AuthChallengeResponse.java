package org.openqa.selenium.devtools.network.model;

import java.util.Objects;

/**
 * Response to an AuthChallenge
 */
public class AuthChallengeResponse {

  /**
   * The decision on what to do in response to the authorization challenge. Default means deferring to the default behavior of the net stack,
   * which will likely either the Cancel authentication or display a popup dialog box
   */
  private final String response;

  /**
   * The username to provide, possibly empty. Should only be set if response is ProvideCredentials
   */
  private final String username;

  /**
   * The password to provide, possibly empty. Should only be set if response is ProvideCredentials
   */
  private final String password;

  public AuthChallengeResponse(String response, String username, String password) {
    this.response = Objects.requireNonNull(response, "response must be set.");
    this.username = username;
    this.password = password;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    AuthChallengeResponse that = (AuthChallengeResponse) o;
    return Objects.equals(response, that.response) &&
           Objects.equals(username, that.username) &&
           Objects.equals(password, that.password);
  }

  @Override
  public int hashCode() {

    return Objects.hash(response, username, password);
  }

  @Override
  public String toString() {
    return "AuthChallengeResponse{" +
           "response='" + response + '\'' +
           ", username='" + username + '\'' +
           ", password='" + password + '\'' +
           '}';
  }

}
