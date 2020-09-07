package org.openqa.selenium;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;

public class AuthenticationTest extends JUnit4TestBase {

  @Before
  public void testRequiresAuthentication() {
    assumeThat(driver).isInstanceOf(HasAuthentication.class);
  }

  @Test
  @NoDriverAfterTest
  public void canAccessUrlProtectedByBasicAuth() {
    ((HasAuthentication) driver).register(UsernameAndPassword.of("test", "test"));

    driver.get(appServer.whereIsWithCredentials("basicAuth", "test", "test"));
    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("authorized");
  }

}
