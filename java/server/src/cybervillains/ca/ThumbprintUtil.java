package cybervillains.ca;

import org.bouncycastle.crypto.digests.SHA1Digest;
import org.bouncycastle.util.encoders.Base64;

import java.security.cert.CertificateEncodingException;
import java.security.cert.X509Certificate;

/**
 * Generates a persistent SHA1 thumbprint for long-term identification of a certificate.
 * 
 * *************************************************************************************** Copyright
 * (c) 2007, Information Security Partners, LLC All rights reserved.
 * 
 * In a special exception, Selenium/OpenQA is allowed to use this code under the Apache License 2.0.
 * 
 * 
 * @author Brad Hill
 * 
 */
public class ThumbprintUtil {

  /**
   * Generates a SHA1 thumbprint of a certificate for long-term mapping.
   * 
   * @param cert
   * @return
   * @throws CertificateEncodingException
   */
  public static String getThumbprint(final X509Certificate cert)
      throws CertificateEncodingException {

    if (cert == null)
    {
      return null;
    }

    byte[] rawOctets = cert.getEncoded();

    SHA1Digest digest = new SHA1Digest();

    byte[] digestOctets = new byte[digest.getDigestSize()];

    digest.update(rawOctets, 0, rawOctets.length);

    digest.doFinal(digestOctets, 0);

    return new String(Base64.encode(digestOctets));
  }

}
