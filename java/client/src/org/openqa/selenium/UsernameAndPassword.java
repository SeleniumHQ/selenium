package org.openqa.selenium;

import org.openqa.selenium.internal.Require;

import java.util.function.Supplier;

public class UsernameAndPassword implements Credentials {

  private final String username;
  private final String password;

  public UsernameAndPassword(String username, String password) {
    this.username = Require.nonNull("User name", username);
    this.password = Require.nonNull("Password", password);
  }

  public static Supplier<Credentials> of(String username, String password) {
    Require.nonNull("User name", username);
    Require.nonNull("Password", password);

    Credentials creds = new UsernameAndPassword(username, password);

    return () -> creds;
  }

  public String username() {
    return username;
  }

  public String password() {
    return password;
  }
}
