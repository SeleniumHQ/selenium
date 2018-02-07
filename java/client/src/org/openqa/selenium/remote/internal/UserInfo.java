package org.openqa.selenium.remote.internal;

public final class UserInfo
{
  private final String user;
  private final String password;

  public UserInfo(final String usernamePassword)
  {
    int indexOfColon = usernamePassword.indexOf(':');
    if (indexOfColon >= 0) {
      this.user = usernamePassword.substring(0, indexOfColon);
      this.password = usernamePassword.substring(indexOfColon + 1);
    } else {
      this.user = usernamePassword;
      this.password = null;
    }
  }

  public String getUser()
  {
    return user;
  }

  public String getPassword()
  {
    return password;
  }
}
