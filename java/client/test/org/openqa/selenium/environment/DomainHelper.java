package org.openqa.selenium.environment;

import org.openqa.selenium.environment.webserver.AppServer;

import com.google.common.base.Preconditions;

public class DomainHelper {

  private String hostname;
  private AppServer appServer;

  public DomainHelper(AppServer appServer) {
    this.appServer = appServer;
  }

  public String getUrlForFirstValidHostname(String path) {
    Preconditions.checkArgument(
      isValidHostname(appServer.getHostName()),
      "Expected valid hostname but was %s",
      appServer.getHostName());
    return appServer.whereIs(path);
  }

  public String getUrlForSecondValidHostname(String path) {
    Preconditions.checkArgument(
      isValidHostname(appServer.getAlternateHostName()),
      "Expected valid hostname but was %s",
      appServer.getHostName());
    return appServer.whereElseIs(path);
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

  private boolean isIpv4Address(String string) {
    return string.matches("\\d{1,3}(?:\\.\\d{1,3}){3}");
  }

  public boolean isValidHostname(String hostname) {
    return isIpv4Address(hostname) || "localhost".equals(hostname);
  }

  public String getHostName() {
    return hostname;
  }
}