package cybervillains.ca;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.openqa.selenium.security.CertificateGenerator;
import org.openqa.selenium.security.KeyAndCert;

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
import java.security.InvalidKeyException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
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
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

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

    Security.insertProviderAt(new BouncyCastleProvider(), 2);

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



    _rsaKpg.initialize(1024, _sr);
    _dsaKpg.initialize(1024, _sr);


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
