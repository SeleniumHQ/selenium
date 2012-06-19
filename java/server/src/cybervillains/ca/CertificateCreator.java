package cybervillains.ca;

import org.bouncycastle.asn1.ASN1Encodable;
import org.bouncycastle.asn1.DERObjectIdentifier;
import org.bouncycastle.asn1.DERSequence;
import org.bouncycastle.asn1.x509.BasicConstraints;
import org.bouncycastle.asn1.x509.CRLDistPoint;
import org.bouncycastle.asn1.x509.DistributionPoint;
import org.bouncycastle.asn1.x509.DistributionPointName;
import org.bouncycastle.asn1.x509.GeneralName;
import org.bouncycastle.asn1.x509.KeyUsage;
import org.bouncycastle.asn1.x509.X509Extensions;
import org.bouncycastle.jce.X509Principal;
import org.bouncycastle.x509.X509V3CertificateGenerator;
import org.bouncycastle.x509.extension.AuthorityKeyIdentifierStructure;
import org.bouncycastle.x509.extension.SubjectKeyIdentifierStructure;

import java.math.BigInteger;
import java.security.InvalidKeyException;
import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SignatureException;
import java.security.cert.CertificateException;
import java.security.cert.CertificateExpiredException;
import java.security.cert.CertificateNotYetValidException;
import java.security.cert.CertificateParsingException;
import java.security.cert.X509Certificate;
import java.util.Date;

import javax.security.auth.x500.X500Principal;

/**
 * Methods for creating certificates.
 * 
 * *************************************************************************************** Copyright
 * (c) 2007, Information Security Partners, LLC All rights reserved.
 * 
 * In a special exception, Selenium/OpenQA is allowed to use this code under the Apache License 2.0.
 * 
 * @author Brad Hill
 * 
 */
public class CertificateCreator {

  /**
   * The default sign algorithm for this package is SHA1 with RSA.
   */
  public static final String SIGN_ALGO = "SHA1withRSA";

  /**
   * Utility method for generating a "standard" server certificate. Recognized by most browsers as
   * valid for SSL/TLS. These certificates are generated de novo, not from a template, so they will
   * not retain the structure of the original certificate and may not be suitable for applications
   * that require Extended Validation/High Assurance SSL or other distinct extensions or EKU.
   * 
   * @throws CertificateParsingException
   * @throws SignatureException
   * @throws InvalidKeyException
   * @throws CertificateExpiredException
   * @throws CertificateNotYetValidException
   * @throws CertificateException
   * @throws NoSuchAlgorithmException
   * @throws NoSuchProviderException
   */
  @SuppressWarnings("deprecation")
  public static X509Certificate generateStdSSLServerCertificate(
      final PublicKey newPubKey,
      final X509Certificate caCert,
      final PrivateKey caPrivateKey,
      final String subject,
      final String certificateRevocationListPath)
      throws SignatureException,
      InvalidKeyException,
      CertificateException,
      NoSuchAlgorithmException,
      NoSuchProviderException
  {
    X509V3CertificateGenerator v3CertGen = new X509V3CertificateGenerator();

    v3CertGen.setSubjectDN(new X500Principal(subject));
    v3CertGen.setSignatureAlgorithm(CertificateCreator.SIGN_ALGO);
    v3CertGen.setPublicKey(newPubKey);
    // 5 years in the future
    v3CertGen
        .setNotAfter(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 30 * 12 * 5));
    // 1 year in the past
    v3CertGen.setNotBefore(new Date(System.currentTimeMillis() - 1000L * 60 * 60 * 24 * 30 * 12));
    v3CertGen.setIssuerDN(caCert.getSubjectX500Principal());

    // Firefox actually tracks serial numbers within a CA and refuses to validate if it sees
    // duplicates
    // This is not a secure serial number generator, (duh!) but it's good enough for our purposes.
    v3CertGen.setSerialNumber(new BigInteger(Long.toString(System.currentTimeMillis())));

    v3CertGen.addExtension(
        X509Extensions.BasicConstraints,
        true,
        new BasicConstraints(false));

    v3CertGen.addExtension(
        X509Extensions.SubjectKeyIdentifier,
        false,
        new SubjectKeyIdentifierStructure(newPubKey));


    v3CertGen.addExtension(
        X509Extensions.AuthorityKeyIdentifier,
        false,
        new AuthorityKeyIdentifierStructure(caCert.getPublicKey()));

    // Firefox 2 disallows these extensions in an SSL server cert. IE7 doesn't care.
    // v3CertGen.addExtension(
    // X509Extensions.KeyUsage,
    // false,
    // new KeyUsage(KeyUsage.dataEncipherment | KeyUsage.digitalSignature ) );

    DERSequence typicalSSLServerExtendedKeyUsages = new DERSequence(new ASN1Encodable[]{
        new DERObjectIdentifier(ExtendedKeyUsageConstants.serverAuth),
        new DERObjectIdentifier(ExtendedKeyUsageConstants.clientAuth),
        new DERObjectIdentifier(ExtendedKeyUsageConstants.netscapeServerGatedCrypto),
        new DERObjectIdentifier(ExtendedKeyUsageConstants.msServerGatedCrypto)
    });

    v3CertGen.addExtension(
        X509Extensions.ExtendedKeyUsage,
        false,
        typicalSSLServerExtendedKeyUsages);

    // Disabled by default. Left in comments in case this is desired.
    //
    // v3CertGen.addExtension(
    // X509Extensions.AuthorityInfoAccess,
    // false,
    // new AuthorityInformationAccess(new DERObjectIdentifier(OID_ID_AD_CAISSUERS),
    // new GeneralName(GeneralName.uniformResourceIdentifier, "http://" + subject + "/aia")));

    if (certificateRevocationListPath != null) {
      /* Safari on Windows requires a CRL and validates it */
      DistributionPoint crl = new DistributionPoint(new DistributionPointName(
          DistributionPointName.FULL_NAME, new GeneralName(
              GeneralName.uniformResourceIdentifier, certificateRevocationListPath)),
          null, null);
      v3CertGen.addExtension(
          X509Extensions.CRLDistributionPoints,
          false,
          new CRLDistPoint(new DistributionPoint[] {crl}));
    }

    return v3CertGen.generate(caPrivateKey, "BC");
  }

  /**
   * Creates a typical Certification Authority (CA) certificate.
   * 
   * @throws SecurityException
   * @throws InvalidKeyException
   * @throws NoSuchProviderException
   * @throws NoSuchAlgorithmException
   * @throws CertificateException
   */
  @SuppressWarnings("deprecation")
  public static X509Certificate createTypicalMasterCert(final KeyPair keyPair)
      throws SignatureException, InvalidKeyException, SecurityException, CertificateException,
      NoSuchAlgorithmException, NoSuchProviderException
  {

    X509V3CertificateGenerator v3CertGen = new X509V3CertificateGenerator();

    X509Principal issuer =
        new X509Principal("O=CyberVillians.com,OU=CyberVillians Certification Authority,C=US");

    // Create
    v3CertGen.setSerialNumber(BigInteger.valueOf(1));
    v3CertGen.setIssuerDN(issuer);
    v3CertGen.setSubjectDN(issuer);

    // Set validity period
    v3CertGen.setNotBefore(new Date(System.currentTimeMillis() - 12 /* months */*
        (1000L * 60 * 60 * 24 * 30)));
    v3CertGen.setNotAfter(new Date(System.currentTimeMillis() + 240 /* months */*
        (1000L * 60 * 60 * 24 * 30)));

    // Set signature algorithm & public key
    v3CertGen.setPublicKey(keyPair.getPublic());
    v3CertGen.setSignatureAlgorithm(CertificateCreator.SIGN_ALGO);

    // Add typical extensions for signing cert
    v3CertGen.addExtension(
        X509Extensions.SubjectKeyIdentifier,
        false,
        new SubjectKeyIdentifierStructure(keyPair.getPublic()));

    v3CertGen.addExtension(
        X509Extensions.BasicConstraints,
        true,
        new BasicConstraints(0));

    v3CertGen.addExtension(
        X509Extensions.KeyUsage,
        false,
        new KeyUsage(KeyUsage.cRLSign | KeyUsage.keyCertSign));

    DERSequence typicalCAExtendedKeyUsages = new DERSequence(new ASN1Encodable[] {
        new DERObjectIdentifier(ExtendedKeyUsageConstants.serverAuth),
        new DERObjectIdentifier(ExtendedKeyUsageConstants.OCSPSigning),
        new DERObjectIdentifier(ExtendedKeyUsageConstants.verisignUnknown)
    });

    v3CertGen.addExtension(
        X509Extensions.ExtendedKeyUsage,
        false,
        typicalCAExtendedKeyUsages);

    X509Certificate cert = v3CertGen.generate(keyPair.getPrivate(), "BC");

    cert.checkValidity(new Date());

    cert.verify(keyPair.getPublic());

    return cert;
  }

}
