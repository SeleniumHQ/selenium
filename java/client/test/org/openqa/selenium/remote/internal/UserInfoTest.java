package org.openqa.selenium.remote.internal;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import org.junit.Test;

public class UserInfoTest {

  @Test
  public void shouldParseFullUserInfo() {
    UserInfo userInfo = new UserInfo("user:pass");
    assertEquals("user", userInfo.getUser());
    assertEquals("pass", userInfo.getPassword());
  }

  @Test
  public void shouldParseUserInfoWithUsernameOnly() {
    UserInfo userInfo = new UserInfo("username");
    assertEquals("username", userInfo.getUser());
    assertEquals(null, userInfo.getPassword());
  }
}
