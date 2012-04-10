package cybervillains.ca;

import org.bouncycastle.asn1.x509.CRLNumber;
import org.bouncycastle.asn1.x509.X509Extensions;
import org.bouncycastle.x509.X509V2CRLGenerator;
import org.bouncycastle.x509.extension.AuthorityKeyIdentifierStructure;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.InterruptedException;
import java.math.BigInteger;
import java.security.*;
import java.security.cert.CRLException;
import java.security.cert.CertificateParsingException;
import java.security.cert.X509CRL;
import java.security.cert.X509Certificate;
import java.util.Date;

 /**
 * Executable to generate new 'CyberVillains' certificates and Java Keystore.
 *
 * Here we use the Java Classes present in the "cybervillains.ca" package
 * to generate a Binary (DER) certificate.
 * Then use OpenSSL to convert his to the final ASCII (DEC) format that
 * Selenium will actually use.
 *
 * To use this class, do something like:
 * <pre>
 * $> cd SELENIUM_SOURCE_DIRECTORY_ROOT
 * $> ./go //java/server/src/cybervillains:cybervillains
 * $> java -cp build/java/server/src/cybervillains/cybervillains.jar:third_party/java/bouncycastle/bcprov-jdk15-146.jar cybervillains.ca.Generator
 * $> cp -r new_certs/* java/server/src/org/openqa/selenium/server/sslSupport/
 * $> rm -r new_certs
 * $> COMMIT TO SELENIUM REPO
 * </pre>
 * 
 * *************************************************************************************** Copyright
 * (c) 2012, NeuStar, Inc. All Rights Reserved.
 * 
 * In a special exception, Selenium/OpenQA is allowed to use this code under the Apache License 2.0.
 * 
 * @author Mark Watson <watsonmw@gmail.com>, Ivan De Marino <ivan.de.marino@gmail.com>
 */
public class Generator {
    private static final String NEW_CERTS_DIR_NAME = "new_certs";
    private static final String OPENSSL_CMD_DEC_TO_PEM = "openssl crl -inform der -in new_certs/blank_crl.dec -out new_certs/blank_crl.pem";

    public static void main(String[] args) {
        File newCertsDir = new File(NEW_CERTS_DIR_NAME);
        newCertsDir.mkdirs();

        // Create a new, blank KeyStore Manager
        KeyStoreManager mgr = new KeyStoreManager(newCertsDir, "blank_crl.pem");

        X509V2CRLGenerator crlGen = new X509V2CRLGenerator();
        Date now = new Date();
        X509Certificate caCrlCert = null;
        try {
            caCrlCert = mgr.getSigningCert();
            PrivateKey caCrlPrivateKey = mgr.getSigningPrivateKey();

            crlGen.setIssuerDN(mgr.getSigningCert().getSubjectX500Principal());
            crlGen.setThisUpdate(now);
            crlGen.setNextUpdate(mgr.getSigningCert().getNotAfter());
            crlGen.setSignatureAlgorithm(mgr.getSigningCert().getSigAlgName());

            crlGen.addExtension(X509Extensions.AuthorityKeyIdentifier,
                    false, new AuthorityKeyIdentifierStructure(caCrlCert));
            crlGen.addExtension(X509Extensions.CRLNumber,
                              false, new CRLNumber(BigInteger.ONE));

            X509CRL crl = crlGen.generate(caCrlPrivateKey);

            // You have to manually convert this file to it's PEM equivalent using OpenSSL:
            // > openssl crl -inform der -in blank_crl.dec -out blank_crl.pem

            // Save the Certificate in Binary (DEC) format
            File certRevoc = new File(newCertsDir, "blank_crl.dec");
            FileOutputStream cerOut = new FileOutputStream(certRevoc);
            byte[] buf = crl.getEncoded();
            cerOut.write(buf);
            cerOut.flush();
            cerOut.close();

            // Convert the generated DEC to PEM using OpenSSL
            Process p = Runtime.getRuntime().exec(OPENSSL_CMD_DEC_TO_PEM);
            p.waitFor();
        } catch (KeyStoreException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (CertificateParsingException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (UnrecoverableKeyException e) {
            e.printStackTrace();
        } catch (InvalidKeyException e) {
            e.printStackTrace();
        } catch (SignatureException e) {
            e.printStackTrace();
        } catch (CRLException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
