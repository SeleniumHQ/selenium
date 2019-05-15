package org.openqa.selenium.devtools.network.types;

/**
 * Created by aohana
 */
public enum CertificateTransparencyCompliance {

  UNKNOWN("unknown"),
  NOT_COMPLIANT("not-compliant"),
  COMPLIANT("compliant");

  private String compliance;

  CertificateTransparencyCompliance(String compliance) {
    this.compliance = compliance;
  }

  public String getCompliance() {
    return compliance;
  }
}
