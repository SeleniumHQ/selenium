package org.openqa.selenium.environment;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.webserver.AppServer;

public class DomainHelper {

  private boolean isOnAlternativeHostName = false;
  private String hostname;
  private AppServer appServer;
  private WebDriver driver;

  public DomainHelper(AppServer appServer, WebDriver driver) {
    this.appServer = appServer;
    this.driver = driver;
  }

  public boolean checkIsOnValidHostname() {
    boolean correct = hostname != null && isValidHostname(hostname);
    if (!correct) {
      System.out.println("Skipping test: unable to find domain name to use");
    }
    return correct;
  }

  public boolean checkIsOnValidSubDomain() {
    boolean correct = hostname != null && isValidSubDomain(hostname);

    if (!correct) {
      System.out.println("Skipping test: unable to find sub domain name to use");
    }
    return correct;
  }

  private boolean isValidSubDomain(String hostname) {
    /*
    * /etc/hosts needs to have e.g.
    *
    * 127.0.0.1       sub.selenium.tests
    *
    */
    return hostname.split("\\.").length >= 3;
  }

  public void gotoValidDomain(String page) {
    this.hostname = null;
    String hostname = appServer.getHostName();
    if (isValidHostname(hostname)) {
      isOnAlternativeHostName = false;
      this.hostname = hostname;
    }
    hostname = appServer.getAlternateHostName();
    if (this.hostname == null && isValidHostname(hostname)) {
      isOnAlternativeHostName = true;
      this.hostname = hostname;
    }
    goToPage(page);
  }

  public void goToPage(String pageName) {
    driver.get(
        isOnAlternativeHostName ? appServer.whereElseIs(pageName) : appServer.whereIs(pageName));
  }

  public void goToOtherPage(String pageName) {
    driver.get(
        isOnAlternativeHostName ? appServer.whereIs(pageName) : appServer.whereElseIs(pageName));
  }

  private boolean isIpv4Address(String string) {
    return string.matches("\\d{1,3}(?:\\.\\d{1,3}){3}");
  }

  public boolean isValidHostname(String hostname) {
    return !isIpv4Address(hostname) && !"localhost".equals(hostname);
  }

  public String getHostName() {
    return hostname;
  }
}