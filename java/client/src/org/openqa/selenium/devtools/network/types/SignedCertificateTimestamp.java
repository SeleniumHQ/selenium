package org.openqa.selenium.devtools.network.types;

/**
 * Created by aohana
 */
public class SignedCertificateTimestamp {

  private String status;

  private String origin;

  private String logDescription;

  private String logId;

  private Double timestamp;

  private String hashAlgorithm;

  private String signatureAlgorithm;

  private String signatureData;

  /** Validation status. */
  public String getStatus() {
    return status;
  }

  /** Validation status. */
  public void setStatus(String status) {
    this.status = status;
  }

  /** Origin. */
  public String getOrigin() {
    return origin;
  }

  /** Origin. */
  public void setOrigin(String origin) {
    this.origin = origin;
  }

  /** Log name / description. */
  public String getLogDescription() {
    return logDescription;
  }

  /** Log name / description. */
  public void setLogDescription(String logDescription) {
    this.logDescription = logDescription;
  }

  /** Log ID. */
  public String getLogId() {
    return logId;
  }

  /** Log ID. */
  public void setLogId(String logId) {
    this.logId = logId;
  }

  /** Issuance date. */
  public Double getTimestamp() {
    return timestamp;
  }

  /** Issuance date. */
  public void setTimestamp(Double timestamp) {
    this.timestamp = timestamp;
  }

  /** Hash algorithm. */
  public String getHashAlgorithm() {
    return hashAlgorithm;
  }

  /** Hash algorithm. */
  public void setHashAlgorithm(String hashAlgorithm) {
    this.hashAlgorithm = hashAlgorithm;
  }

  /** Signature algorithm. */
  public String getSignatureAlgorithm() {
    return signatureAlgorithm;
  }

  /** Signature algorithm. */
  public void setSignatureAlgorithm(String signatureAlgorithm) {
    this.signatureAlgorithm = signatureAlgorithm;
  }

  /** Signature data. */
  public String getSignatureData() {
    return signatureData;
  }

  /** Signature data. */
  public void setSignatureData(String signatureData) {
    this.signatureData = signatureData;
  }
}
