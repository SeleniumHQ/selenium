package org.openqa.selenium.devtools.network.model;

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

  public static CertificateTransparencyCompliance fromString(String s) {
    for (CertificateTransparencyCompliance ctp : CertificateTransparencyCompliance.values()) {
      if (ctp.getCompliance().equalsIgnoreCase(s)) {
        return ctp;
      }
    }
    return null;
  }

}
