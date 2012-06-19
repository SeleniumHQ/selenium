package cybervillains.ca;

import org.bouncycastle.asn1.ASN1Encodable;
import org.bouncycastle.asn1.DERObjectIdentifier;
import org.bouncycastle.asn1.DERSequence;
import org.bouncycastle.asn1.x509.BasicConstraints;
import org.bouncycastle.asn1.x509.KeyUsage;
import org.bouncycastle.asn1.x509.X509Extensions;
import org.bouncycastle.jce.X509Principal;
import org.bouncycastle.x509.X509V3CertificateGenerator;
import org.bouncycastle.x509.extension.SubjectKeyIdentifierStructure;

import java.math.BigInteger;
import java.security.InvalidKeyException;
import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SignatureException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Date;

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
