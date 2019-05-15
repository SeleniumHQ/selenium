package org.openqa.selenium.devtools.network.types;

/**
 * Whether the request complied with Certificate Transparency policy
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
