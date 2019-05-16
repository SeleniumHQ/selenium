package org.openqa.selenium.devtools.network.types;

/**
 * Whether the request complied with Certificate Transparency policy
 */
public enum CertificateTransparencyCompliance {

  Unknown("unknown"),
  NotCompliant("not-compliant"),
  Compliant("compliant");

  private String compliance;

  CertificateTransparencyCompliance(String compliance) {
    this.compliance = compliance;
  }

  public String getCompliance() {
    return compliance;
  }
}
