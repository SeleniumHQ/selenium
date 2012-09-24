/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.security;

import com.google.common.base.Throwables;
import com.google.common.io.Closeables;

import org.bouncycastle.asn1.ASN1Encodable;
import org.bouncycastle.asn1.ASN1InputStream;
import org.bouncycastle.asn1.ASN1Sequence;
import org.bouncycastle.asn1.DERObjectIdentifier;
import org.bouncycastle.asn1.DERSequence;
import org.bouncycastle.asn1.x509.AuthorityKeyIdentifier;
import org.bouncycastle.asn1.x509.BasicConstraints;
import org.bouncycastle.asn1.x509.CRLDistPoint;
import org.bouncycastle.asn1.x509.DistributionPoint;
import org.bouncycastle.asn1.x509.DistributionPointName;
import org.bouncycastle.asn1.x509.GeneralName;
import org.bouncycastle.asn1.x509.SubjectPublicKeyInfo;
import org.bouncycastle.asn1.x509.X509Extension;
import org.bouncycastle.cert.X509CertificateHolder;
import org.bouncycastle.cert.X509v3CertificateBuilder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509ExtensionUtils;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.OperatorCreationException;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.Security;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import javax.security.auth.x500.X500Principal;

public class CertificateGenerator {

  private static final String KEY_PURPOSE_BASE = "1.3.6.1.5.5.7.3";
  private static final String SERVER_AUTH = KEY_PURPOSE_BASE + ".1";
  private static final String CLIENT_AUTH = KEY_PURPOSE_BASE + ".2";
  private static final String BOUNCY_CASTLE = "BC";
  private static char[] SIGNING_PASSWORD = "password".toCharArray();

  private final KeyAndCert caCert;

  private final File serializedStore;
  private final KeyPairGenerator pairGenerator;

  public CertificateGenerator(File root) {
    Security.addProvider(new BouncyCastleProvider());

    serializedStore = new File(root, "cybervillainsCA.jks");

    try {
      pairGenerator = KeyPairGenerator.getInstance("RSA");
      pairGenerator.initialize(1024);

      caCert = readRootSigningCert();
    } catch (NoSuchAlgorithmException e) {
      throw Throwables.propagate(e);
    }
  }

  public KeyAndCert generateCertificate(String hostname, String certificateRevocationList) {
    X500Principal x500issuer = caCert.getCertificate().getIssuerX500Principal();
    String subject = String.format(
        "CN=%s, OU=Test, O=CyberVillainsCA, L=Seattle, S=Washington, C=US", hostname);
    X500Principal x500subject = new X500Principal(subject);

    Date begin = new Date(System.currentTimeMillis() - TimeUnit.DAYS.toMillis(1));
    Date end = new Date(System.currentTimeMillis() + TimeUnit.DAYS.toMillis(365));

    KeyPair keypair = pairGenerator.generateKeyPair();

    try {
      SubjectPublicKeyInfo info = new SubjectPublicKeyInfo(
          (ASN1Sequence) new ASN1InputStream(
              new ByteArrayInputStream(keypair.getPublic().getEncoded())).readObject());

      X509v3CertificateBuilder builder = new JcaX509v3CertificateBuilder(x500issuer,
                                       BigInteger.valueOf(new Date().getTime()/1000),
                                       begin,
                                       end, x500subject, keypair.getPublic());
      builder.addExtension(X509Extension.basicConstraints, true, new BasicConstraints(false));
      builder.addExtension(X509Extension.subjectKeyIdentifier, false, info);

      AuthorityKeyIdentifier caIdentifier = new JcaX509ExtensionUtils()
          .createAuthorityKeyIdentifier(caCert.getCertificate());
      builder.addExtension(X509Extension.authorityKeyIdentifier, false, caIdentifier);

      DERSequence typicalSSLServerExtendedKeyUsages = new DERSequence(new ASN1Encodable[]{
          new DERObjectIdentifier(SERVER_AUTH),
          new DERObjectIdentifier(CLIENT_AUTH),
      });

      builder.addExtension(X509Extension.extendedKeyUsage, false, typicalSSLServerExtendedKeyUsages);

      if (certificateRevocationList != null) {
        /* Safari on Windows requires a CRL and validates it */
        DistributionPoint crl = new DistributionPoint(new DistributionPointName(
            DistributionPointName.FULL_NAME, new GeneralName(
            GeneralName.uniformResourceIdentifier, certificateRevocationList)), null, null);
        builder.addExtension(
            X509Extension.cRLDistributionPoints,
            false,
            new CRLDistPoint(new DistributionPoint[]{crl}));
      }

      ContentSigner signer = new JcaContentSignerBuilder("SHA1withRSA").setProvider(BOUNCY_CASTLE)
          .build(caCert.getPrivateKey());

      X509CertificateHolder holder = builder.build(signer);
      X509Certificate cert = new JcaX509CertificateConverter().setProvider(BOUNCY_CASTLE)
          .getCertificate(holder);

      return new KeyAndCert(keypair.getPrivate(), cert);
    } catch(GeneralSecurityException e) {
      throw Throwables.propagate(e);
    } catch (IOException e) {
      throw Throwables.propagate(e);
    } catch (OperatorCreationException e) {
      throw Throwables.propagate(e);
    }
  }

  private KeyAndCert readRootSigningCert() {
    InputStream is = null;

    try {
      KeyStore keystore = KeyStore.getInstance("JKS");

      is = new FileInputStream(serializedStore);

      keystore.load(is, SIGNING_PASSWORD);
      X509Certificate caCert = (X509Certificate) keystore.getCertificate("signingCert");
      PrivateKey caPrivateKey = (PrivateKey) keystore.getKey("signingCertPrivKey", SIGNING_PASSWORD);

      return new KeyAndCert(caPrivateKey, caCert);
    } catch (KeyStoreException e) {
      throw Throwables.propagate(e);
    } catch (CertificateException e) {
      throw Throwables.propagate(e);
    } catch (UnrecoverableKeyException e) {
      throw Throwables.propagate(e);
    } catch (NoSuchAlgorithmException e) {
      throw Throwables.propagate(e);
    } catch (FileNotFoundException e) {
      throw Throwables.propagate(e);
    } catch (IOException e) {
      throw Throwables.propagate(e);
    } finally {
      Closeables.closeQuietly(is);
    }

  }
}
