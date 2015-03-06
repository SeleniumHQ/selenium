package cybervillains.ca;

import org.bouncycastle.jcajce.provider.config.ConfigurableProvider;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.openqa.selenium.server.security.CertificateGenerator;
import org.openqa.selenium.server.security.KeyAndCert;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutput;
import java.io.ObjectOutputStream;
import java.io.OutputStream;
import java.math.BigInteger;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.security.Provider;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.Security;
import java.security.SignatureException;
import java.security.UnrecoverableKeyException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateExpiredException;
import java.security.cert.CertificateNotYetValidException;
import java.security.cert.CertificateParsingException;
import java.security.cert.X509Certificate;
import java.security.spec.DSAParameterSpec;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.crypto.spec.DHParameterSpec;

/**
 * This is the main entry point into the Cybervillains CA.
 * 
 * This class handles generation, storage and the persistent mapping of input to duplicated
 * certificates and mapped public keys.
 * 
 * Default setting is to immediately persist changes to the store by writing out the keystore and
 * mapping file every time a new certificate is added. This behavior can be disabled if desired, to
 * enhance performance or allow temporary testing without modifying the certificate store.
 * 
 *************************************************************************************** 
 * Copyright (c) 2007, Information Security Partners, LLC All rights reserved.
 * 
 * In a special exception, Selenium/OpenQA is allowed to use this code under the Apache License 2.0.
 * 
 * @author Brad Hill
 * 
 */
public class KeyStoreManager {

  static Logger log = Logger.getLogger(KeyStoreManager.class.getName());
  private final String CERTMAP_SER_FILE = "certmap.ser";
  private final String SUBJMAP_SER_FILE = "subjmap.ser";

  @SuppressWarnings("FieldCanBeLocal")
  private final String EXPORTED_CERT_NAME = "cybervillainsCA.cer";

  private final char[] _keypassword = "password".toCharArray();
  private final char[] _keystorepass = "password".toCharArray();
  private final String _caPrivateKeystore = "cybervillainsCA.jks";
  private final String _caCertAlias = "signingCert";
  public static final String _caPrivKeyAlias = "signingCertPrivKey";

  X509Certificate _caCert;
  PrivateKey _caPrivKey;
  KeyStore _ks;

  private HashMap<PublicKey, PrivateKey> _rememberedPrivateKeys;
  private HashMap<PublicKey, PublicKey> _mappedPublicKeys;
  private HashMap<String, String> _certMap;
  private HashMap<String, String> _subjectMap;

  private final String KEYMAP_SER_FILE = "keymap.ser";
  private final String PUB_KEYMAP_SER_FILE = "pubkeymap.ser";

  public final String RSA_KEYGEN_ALGO = "RSA";
  public final String DSA_KEYGEN_ALGO = "DSA";
  public final KeyPairGenerator _rsaKpg;
  public final KeyPairGenerator _dsaKpg;


  private boolean persistImmediately = true;
  private File root;
  private final String certificateRevocationList;

  @SuppressWarnings("unchecked")
  public KeyStoreManager(File root, String certificateRevocationList) {
    this.root = root;
    this.certificateRevocationList = certificateRevocationList;

    ConfigurableProvider bcProv = new BouncyCastleProvider();

    DHParameterSpec dhSpec512 = new DHParameterSpec(
        new BigInteger("fca682ce8e12caba26efccf7110e526db078b05edecbcd1eb4a208f"
            + "3ae1617ae01f35b91a47e6df63413c5e12ed0899bcd132acd50d99151bdc43ee"
            + "737592e17", 16),
        new BigInteger("678471b27a9cf44ee91a49c5147db1a9aaf244f05a434d6486931d2"
            + "d14271b9e35030b71fd73da179069b32e2935630e1c2062354d0da20a6c416e5"
            + "0be794ca4", 16),
        384);

    DHParameterSpec dhSpec768 = new DHParameterSpec(
        new BigInteger("e9e642599d355f37c97ffd3567120b8e25c9cd43e927b3a9670fbec"
            + "5d890141922d2c3b3ad2480093799869d1e846aab49fab0ad26d2ce6a22219d4"
            + "70bce7d777d4a21fbe9c270b57f607002f3cef8393694cf45ee3688c11a8c56a"
            + "b127a3daf", 16),
        new BigInteger("30470ad5a005fb14ce2d9dcd87e38bc7d1b1c5facbaecbe95f190aa"
            + "7a31d23c4dbbcbe06174544401a5b2c020965d8c2bd2171d3668445771f74ba0"
            + "84d2029d83c1c158547f3a9f1a2715be23d51ae4d3e5a1f6a7064f316933a346"
            + "d3f529252", 16),
        384);

    DHParameterSpec dhSpec1024 = new DHParameterSpec(
        new BigInteger("f7e1a085d69b3ddecbbcab5c36b857b97994afbbfa3aea82f9574c0"
            + "b3d0782675159578ebad4594fe67107108180b449167123e84c281613b7cf093"
            + "28cc8a6e13c167a8b547c8d28e0a3ae1e2bb3a675916ea37f0bfa213562f1fb6"
            + "27a01243bcca4f1bea8519089a883dfe15ae59f06928b665e807b552564014c3"
            + "bfecf492a", 16),
        new BigInteger("fd7f53811d75122952df4a9c2eece4e7f611b7523cef4400c31e3f8"
            + "0b6512669455d402251fb593d8d58fabfc5f5ba30f6cb9b556cd7813b801d346"
            + "ff26660b76b9950a5a49f9fe8047b1022c24fbba9d7feb7c61bf83b57e7c6a8a"
            + "6150f04fb83f6d3c51ec3023554135a169132f675f3ae2b61d72aeff22203199"
            + "dd14801c7", 16),
        512);

    bcProv.setParameter(ConfigurableProvider.DH_DEFAULT_PARAMS,
        new DHParameterSpec[] { dhSpec512, dhSpec768, dhSpec1024 });

    Security.insertProviderAt((Provider) bcProv, 2);

    SecureRandom _sr = new SecureRandom();

    try
    {
      _rsaKpg = KeyPairGenerator.getInstance(RSA_KEYGEN_ALGO);
      _dsaKpg = KeyPairGenerator.getInstance(DSA_KEYGEN_ALGO);
    } catch (Throwable t)
    {
      throw new Error(t);
    }

    try {

      File privKeys = new File(root, KEYMAP_SER_FILE);


      if (!privKeys.exists())
      {
        _rememberedPrivateKeys = new HashMap<PublicKey, PrivateKey>();
      }
      else
      {
        ObjectInputStream in = new ObjectInputStream(new FileInputStream(privKeys));
        // Deserialize the object
        _rememberedPrivateKeys = (HashMap<PublicKey, PrivateKey>) in.readObject();
        in.close();
      }


      File pubKeys = new File(root, PUB_KEYMAP_SER_FILE);

      if (!pubKeys.exists())
      {
        _mappedPublicKeys = new HashMap<PublicKey, PublicKey>();
      }
      else
      {
        ObjectInputStream in = new ObjectInputStream(new FileInputStream(pubKeys));
        // Deserialize the object
        _mappedPublicKeys = (HashMap<PublicKey, PublicKey>) in.readObject();
        in.close();
      }

    } catch (FileNotFoundException e) {
      // check for file exists, won't happen.
      e.printStackTrace();
    } catch (IOException e) {
      // we could correct, but this probably indicates a corruption
      // of the serialized file that we want to know about; likely
      // synchronization problems during serialization.
      e.printStackTrace();
      throw new Error(e);
    } catch (ClassNotFoundException e) {
      // serious problem.
      e.printStackTrace();
      throw new Error(e);
    }


    BigInteger p = new BigInteger(
            "fd7f53811d75122952df4a9c2eece4e7f611b7523cef4400c31e3f80b6512669"
          + "455d402251fb593d8d58fabfc5f5ba30f6cb9b556cd7813b801d346ff26660b7"
          + "6b9950a5a49f9fe8047b1022c24fbba9d7feb7c61bf83b57e7c6a8a6150f04fb"
          + "83f6d3c51ec3023554135a169132f675f3ae2b61d72aeff22203199dd14801c7", 16);
    BigInteger q = new BigInteger("9760508f15230bccb292b982a2eb840bf0581cf5", 16);
    BigInteger g = new BigInteger(
            "f7e1a085d69b3ddecbbcab5c36b857b97994afbbfa3aea82f9574c0b3d078267"
          + "5159578ebad4594fe67107108180b449167123e84c281613b7cf09328cc8a6e1"
          + "3c167a8b547c8d28e0a3ae1e2bb3a675916ea37f0bfa213562f1fb627a01243b"
          + "cca4f1bea8519089a883dfe15ae59f06928b665e807b552564014c3bfecf492a", 16);

    DSAParameterSpec dsaParameterSpec = new DSAParameterSpec(p, q, g);

    _rsaKpg.initialize(1024, _sr);
    try {
        _dsaKpg.initialize(dsaParameterSpec, _sr);
    } catch (InvalidAlgorithmParameterException e) {
        e.printStackTrace();
        _dsaKpg.initialize(1024, _sr);
    }

    try
    {
      _ks = KeyStore.getInstance("JKS");

      reloadKeystore();
    } catch (FileNotFoundException fnfe)
    {
      try
      {
        createKeystore();
      } catch (Exception e)
      {
        throw new Error(e);
      }
    } catch (Exception e)
    {
      throw new Error(e);
    }


    try {

      File file = new File(root, CERTMAP_SER_FILE);

      if (!file.exists())
      {
        _certMap = new HashMap<String, String>();
      }
      else
      {
        ObjectInputStream in = new ObjectInputStream(new FileInputStream(file));
        // Deserialize the object
        _certMap = (HashMap<String, String>) in.readObject();
        in.close();
      }

    } catch (FileNotFoundException e) {
      // won't happen, check file.exists()
      e.printStackTrace();
    } catch (IOException e) {
      // corrupted file, we want to know.
      e.printStackTrace();
      throw new Error(e);
    } catch (ClassNotFoundException e) {
      // something very wrong, exit
      e.printStackTrace();
      throw new Error(e);
    }


    try {

      File file = new File(root, SUBJMAP_SER_FILE);

      if (!file.exists())
      {
        _subjectMap = new HashMap<String, String>();
      }
      else
      {
        ObjectInputStream in = new ObjectInputStream(new FileInputStream(file));
        // Deserialize the object
        _subjectMap = (HashMap<String, String>) in.readObject();
        in.close();
      }

    } catch (FileNotFoundException e) {
      // won't happen, check file.exists()
      e.printStackTrace();
    } catch (IOException e) {
      // corrupted file, we want to know.
      e.printStackTrace();
      throw new Error(e);
    } catch (ClassNotFoundException e) {
      // something very wrong, exit
      e.printStackTrace();
      throw new Error(e);
    }


  }

  private void reloadKeystore() throws IOException,
      NoSuchAlgorithmException, CertificateException, KeyStoreException, UnrecoverableKeyException {
    InputStream is = new FileInputStream(new File(root, _caPrivateKeystore));

    _ks.load(is, _keystorepass);
    _caCert = (X509Certificate) _ks.getCertificate(_caCertAlias);
    _caPrivKey = (PrivateKey) _ks.getKey(_caPrivKeyAlias, _keypassword);
  }

  /**
   * Creates, writes and loads a new keystore and CA root certificate.
   */
  protected void createKeystore() {

    Certificate signingCert;
    PrivateKey caPrivKey;

    if (_caCert == null || _caPrivKey == null)
    {
      try
      {
        log.fine("Keystore or signing cert & keypair not found.  Generating...");

        KeyPair caKeypair = getRSAKeyPair();
        caPrivKey = caKeypair.getPrivate();
        signingCert = CertificateCreator.createTypicalMasterCert(caKeypair);

        log.fine("Done generating signing cert");
        log.fine(String.valueOf(signingCert));

        _ks.load(null, _keystorepass);

        _ks.setCertificateEntry(_caCertAlias, signingCert);
        _ks.setKeyEntry(_caPrivKeyAlias, caPrivKey, _keypassword, new Certificate[] {signingCert});

        File caKsFile = new File(root, _caPrivateKeystore);

        OutputStream os = new FileOutputStream(caKsFile);
        _ks.store(os, _keystorepass);

        log.fine("Wrote JKS keystore to: " +
            caKsFile.getAbsolutePath());

        // also export a .cer that can be imported as a trusted root
        // to disable all warning dialogs for interception

        File signingCertFile = new File(root, EXPORTED_CERT_NAME);

        FileOutputStream cerOut = new FileOutputStream(signingCertFile);

        byte[] buf = signingCert.getEncoded();

        log.fine("Wrote signing cert to: " + signingCertFile.getAbsolutePath());

        cerOut.write(buf);
        cerOut.flush();
        cerOut.close();

        _caCert = (X509Certificate) signingCert;
        _caPrivKey = caPrivKey;
      } catch (Exception e)
      {
        log.log(Level.SEVERE, "Fatal error creating/storing keystore or signing cert.", e);
        throw new Error(e);
      }
    }
    else
    {
      log.fine("Successfully loaded keystore.");
      log.fine(String.valueOf(_caCert));

    }

  }

  /**
   * Stores a new certificate and its associated private key in the keystore.
   * 
   * @throws KeyStoreException
   * @throws CertificateException
   * @throws NoSuchAlgorithmException
   */
  public synchronized void addCertAndPrivateKey(String hostname, final X509Certificate cert,
      final PrivateKey privKey)
      throws KeyStoreException, CertificateException, NoSuchAlgorithmException
  {
    // String alias = ThumbprintUtil.getThumbprint(cert);

    _ks.deleteEntry(hostname);

    _ks.setCertificateEntry(hostname, cert);
    _ks.setKeyEntry(hostname, privKey, _keypassword, new Certificate[] {cert});

    if (persistImmediately)
    {
      persist();
    }

  }

  /**
   * Writes the keystore and certificate/keypair mappings to disk.
   * 
   * @throws KeyStoreException
   * @throws NoSuchAlgorithmException
   * @throws CertificateException
   */
  public synchronized void persist() throws KeyStoreException, NoSuchAlgorithmException,
      CertificateException {
    try
    {
      FileOutputStream kso = new FileOutputStream(new File(root, _caPrivateKeystore));
      _ks.store(kso, _keystorepass);
      kso.flush();
      kso.close();
      persistCertMap();
      persistSubjectMap();
      persistKeyPairMap();
      persistPublicKeyMap();
    } catch (IOException ioe)
    {
      ioe.printStackTrace();
    }
  }

  /**
   * Returns the aliased certificate. Certificates are aliased by their SHA1 digest.
   * 
   * @see ThumbprintUtil
   * @throws KeyStoreException
   */
  public synchronized X509Certificate getCertificateByAlias(final String alias)
      throws KeyStoreException {
    return (X509Certificate) _ks.getCertificate(alias);
  }

  /**
   * Returns the aliased certificate. Certificates are aliased by their hostname.
   * 
   * @see ThumbprintUtil
   * @throws KeyStoreException
   * @throws UnrecoverableKeyException
   * @throws NoSuchProviderException
   * @throws NoSuchAlgorithmException
   * @throws CertificateException
   * @throws SignatureException
   * @throws CertificateNotYetValidException
   * @throws CertificateExpiredException
   * @throws InvalidKeyException
   * @throws CertificateParsingException
   */
  public synchronized X509Certificate getCertificateByHostname(final String hostname)
      throws KeyStoreException, InvalidKeyException, SignatureException, CertificateException,
             NoSuchAlgorithmException, NoSuchProviderException, UnrecoverableKeyException {

    String alias = _subjectMap.get(getSubjectForHostname(hostname));

    if (alias != null) {
      return (X509Certificate) _ks.getCertificate(alias);
    }
    return getMappedCertificateForHostname(hostname);
  }

  /**
   * Gets the authority root signing cert.
   * 
   * @throws KeyStoreException
   */
  public synchronized X509Certificate getSigningCert() throws KeyStoreException {
    return _caCert;
  }

  /**
   * Gets the authority private signing key.
   * 
   * @throws KeyStoreException
   * @throws NoSuchAlgorithmException
   * @throws UnrecoverableKeyException
   */
  public synchronized PrivateKey getSigningPrivateKey() throws KeyStoreException,
      NoSuchAlgorithmException, UnrecoverableKeyException {
    return _caPrivKey;
  }

  /**
   * This method returns the mapped certificate for a hostname, or generates a "standard" SSL server
   * certificate issued by the CA to the supplied subject if no mapping has been created. This is
   * not a true duplication, just a shortcut method that is adequate for web browsers.
   * 
   * @throws CertificateParsingException
   * @throws InvalidKeyException
   * @throws CertificateExpiredException
   * @throws CertificateNotYetValidException
   * @throws SignatureException
   * @throws CertificateException
   * @throws NoSuchAlgorithmException
   * @throws NoSuchProviderException
   * @throws KeyStoreException
   * @throws UnrecoverableKeyException
   */
  public X509Certificate getMappedCertificateForHostname(String hostname)
      throws InvalidKeyException, SignatureException, CertificateException,
      NoSuchAlgorithmException, NoSuchProviderException, KeyStoreException,
      UnrecoverableKeyException
  {
    String subject = getSubjectForHostname(hostname);

    String thumbprint = _subjectMap.get(subject);

    if (thumbprint == null) {
      KeyAndCert keyAndCert = new CertificateGenerator(root).generateCertificate(
          hostname, certificateRevocationList);
      X509Certificate newCert = keyAndCert.getCertificate();

      addCertAndPrivateKey(hostname, newCert, keyAndCert.getPrivateKey());

      thumbprint = ThumbprintUtil.getThumbprint(newCert);

      _subjectMap.put(subject, thumbprint);

      if (persistImmediately) {
        persist();
      }

      return newCert;

    }
    return getCertificateByAlias(thumbprint);


  }

  private String getSubjectForHostname(String hostname) {
    return "CN=" + hostname + ", OU=Test, O=CyberVillainsCA, L=Seattle, S=Washington, C=US";
  }

  private synchronized void persistCertMap() {
    try {
      ObjectOutput out =
          new ObjectOutputStream(new FileOutputStream(new File(root, CERTMAP_SER_FILE)));
      out.writeObject(_certMap);
      out.flush();
      out.close();
    } catch (FileNotFoundException e) {
      // writing, this shouldn't happen...
      e.printStackTrace();
    } catch (IOException e) {
      // big problem!
      e.printStackTrace();
      throw new Error(e);
    }
  }



  private synchronized void persistSubjectMap() {
    try {
      ObjectOutput out =
          new ObjectOutputStream(new FileOutputStream(new File(root, SUBJMAP_SER_FILE)));
      out.writeObject(_subjectMap);
      out.flush();
      out.close();
    } catch (FileNotFoundException e) {
      // writing, this shouldn't happen...
      e.printStackTrace();
    } catch (IOException e) {
      // big problem!
      e.printStackTrace();
      throw new Error(e);
    }
  }

  /**
   * Generate an RSA Key Pair
   */
  public KeyPair getRSAKeyPair()
  {
    KeyPair kp = _rsaKpg.generateKeyPair();
    rememberKeyPair(kp);
    return kp;

  }

  private synchronized void persistPublicKeyMap() {
    try {
      ObjectOutput out =
          new ObjectOutputStream(new FileOutputStream(new File(root, PUB_KEYMAP_SER_FILE)));
      out.writeObject(_mappedPublicKeys);
      out.flush();
      out.close();
    } catch (FileNotFoundException e) {
      // writing, won't happen
      e.printStackTrace();
    } catch (IOException e) {
      // very bad
      e.printStackTrace();
      throw new Error(e);
    }
  }

  private synchronized void persistKeyPairMap() {
    try {
      ObjectOutput out =
          new ObjectOutputStream(new FileOutputStream(new File(root, KEYMAP_SER_FILE)));
      out.writeObject(_rememberedPrivateKeys);
      out.flush();
      out.close();
    } catch (FileNotFoundException e) {
      // writing, won't happen.
      e.printStackTrace();
    } catch (IOException e) {
      // very bad
      e.printStackTrace();
      throw new Error(e);
    }
  }

  private synchronized void rememberKeyPair(final KeyPair kp)
  {
    _rememberedPrivateKeys.put(kp.getPublic(), kp.getPrivate());
    if (persistImmediately) {
      persistKeyPairMap();
    }
  }

  public KeyStore getKeyStore() {
    return _ks;
  }
}
