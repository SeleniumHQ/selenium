// ========================================================================
// $Id: KeyPairTool.java,v 1.11 2004/11/21 11:37:28 gregwilkins Exp $
// Copyright 1998-2004 Mort Bay Consulting Pty. Ltd.
// ------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

package org.openqa.jetty.util;

import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.Provider;
import java.security.Security;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.ArrayList;

// Document our single dependency on the Util package.

/* ------------------------------------------------------------ */
/**
 * Perform simple private key management for keystores.
 *
 * <p> The current keytool lacks the ability to insert a key/cert pair sourced
 *     from another tool. This utility fills that gap.
 * 
 * <p> Currently this only works for RSA key/cert pairs.
 *
 * <p> The inverse operation, exporting a keypair to an external format, has
 *     been left as an exercise for the reader... :-)
 *
 * @version $Id: KeyPairTool.java,v 1.11 2004/11/21 11:37:28 gregwilkins Exp $
 * @author Brett Sealey
 */
public class KeyPairTool
{
    // Default settings...
    private File keyStoreFile
        = new File(System.getProperty("user.home"), ".keystore");
    private String keyStoreType = KeyStore.getDefaultType();
    private Password keyStorePassword = null;
    private Password keyPassword = null;
    private String alias = "mykey";
    private File privateKeyFile = null;
    private File certFile = null;
    private String providerClassName
    = "org.bouncycastle.jce.provider.BouncyCastleProvider";


    private static final String usageString
        = "Tool to insert a private key/certificate pair into a keystore.\n"
        + "Parameters:\n"
        + " -key        FILENAME, location of private key [MANDATORY]\n"
        + " -cert       FILENAME, location of certificate [MANDATORY]\n"
        + " -storepass  PASSWORD, keystore password       [OPTIONAL - security RISK!]\n"
        + " -keypass    PASSWORD, password for new entry  [=STOREPASS]\n"
        + " -keystore   FILENAME, location of keystore,   [~/.keystore]\n"
        + " -storetype  STRING,   name/type of keystore,  ["
        + KeyStore.getDefaultType() + "]\n"
        + " -alias      NAME,     alias used to store key [mykey]\n"
        + " -provider   NAME,     name of provider class [org.bouncycastle.jce.provider.BouncyCastleProvider]\n\n"
        + "The keystore and key passwords will be prompted for or can be\n"
        + "set with the following JVM system properties:\n"
        + "  jetty.ssl.password\n"
        + "  jetty.ssl.keypassword";

    
    /* ------------------------------------------------------------ */
    /** main entry point to start this tool
     * @param args String array containing command line arguments
     */
    public static void main(String[] args)
    {
        // Doit
        KeyPairTool tool = new KeyPairTool();
        tool.doit(args);
    }

    /* ------------------------------------------------------------ */
    /**
     * Load parameters and perform the import command.
     * Catch any exceptions and clear the password arrays.
     * @param args String array containing command line arguments
     */
    private void doit(String[] args)
    {
        try
        {
            // load parameters from the commandline
            loadParameters(args);

            // Try to load the private key
            importKeyPair();
        }
        catch (Exception e)
        {
            System.out.println("Exception: " + e.getMessage());
            e.printStackTrace();
            
            System.exit(23);
        }
    }

    /* ------------------------------------------------------------ */
    /**
     * Import a key/cert pair into the keystore.
     * <p> Class variables hold the state information required for this
     *     operation.
     * @throws IOException if there are problems with file IO
     * @throws GeneralSecurityException if there are cryptographic failures.
     * @throws Exception on other exceptions, such as classloading failures.
     */
    private void importKeyPair()
            throws IOException, GeneralSecurityException, Exception
    {
    // Load the private key
        PrivateKey privateKey = loadPrivateKey(privateKeyFile);
    
        // Import the cert...
    Certificate[] certChain = loadCertChain(certFile);

        // Load any existing KeyStore
        if (keyPassword == null)
            keyPassword = keyStorePassword;

        KeyStore keyStore = KeyStore.getInstance(keyStoreType);
        InputStream keyStoreStream = null;
        try
        {
        keyStoreStream = new FileInputStream(keyStoreFile);
        System.out.println("Will load " + keyStoreType
                   + " keystore: " + keyStoreFile);
        }
        catch (FileNotFoundException e)
        {
            // That's OK, we'll just create a new one
            System.out.println("Creating keystore: " + keyStoreFile);
        }

        // The load method can accept a null keyStoreStream.
        keyStore.load(keyStoreStream, keyStorePassword.toString().toCharArray());

        if (keyStoreStream != null)
        {
            keyStoreStream.close();
            System.out.println("Keystore loaded OK...");
        }

        // Insert the new key pair
        keyStore.setKeyEntry(alias,
                             privateKey,
                             keyPassword.toString().toCharArray(),
                             certChain);

        // Save the KeyStore
        FileOutputStream keyStoreOut = new FileOutputStream(keyStoreFile);
        keyStore.store(keyStoreOut,
                       keyStorePassword.toString().toCharArray());
        keyStoreOut.close();

        System.out.println("Keys have been written to keystore");
    }

    /* ------------------------------------------------------------ */
    /**
     * Load the chain of certificates from the given File.
     * <p> Note that the certificates must be in the correct order to
     * form a valid chain starting with the cert corresponding to the
     * private key and ending with the cert just before the top level
     * cert.
     * @param certFile String name of file to load the key from
     * @return PrivateKey loaded from the file
     * @throws Exception if there are problems with loading the key.
     */
    private Certificate[] loadCertChain(File certFile)
	throws Exception
    {
        DataInputStream dis = null;
        try
        {
            FileInputStream fis = new FileInputStream(certFile);
            dis = new DataInputStream(fis);
            byte[] bytes = new byte[dis.available()];
            dis.readFully(bytes);
            ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
	
            CertificateFactory certificateFactory
                = CertificateFactory.getInstance("X.509");

            ArrayList chain = new ArrayList();
            while (bais.available() > 0) {
                Certificate cert
                    = certificateFactory.generateCertificate(bais);
                // System.out.println(cert.toString());
                chain.add(cert);
            }

            Certificate[] certChain
                = (Certificate[])chain.toArray(new Certificate[chain.size()]);

            System.out.println("Loaded the cert chain. Depth = "
                               + certChain.length);
            return certChain;
        }
        finally
        {
            IO.close(dis);
        }
    }
    
    /* ------------------------------------------------------------ */
    /**
     * Load an RSA private key from the given File
     * @param privateKeyFile String name of file to load the key from
     * @return PrivateKey loaded from the file
     * @throws Exception if there are problems with loading the key.
     */
    private PrivateKey loadPrivateKey(File privateKeyFile)
    throws Exception
    {
    // Load the key file.
    System.out.println("Loading private key from "
               + privateKeyFile
               + ", using " + providerClassName
               + " as the private key loading provider");
        FileInputStream privateKeyInputStream = null;
        byte[] keyBytes;
        
        try
        {
            privateKeyInputStream = new FileInputStream(privateKeyFile);
            keyBytes = new byte[(int) privateKeyFile.length()];
            privateKeyInputStream.read(keyBytes);
        }
        finally
        {
            IO.close(privateKeyInputStream);
        }
    
        // Dynamically register the Bouncy Castle provider for RSA
    // support.
    Class providerClass = Loader.loadClass(this.getClass(),providerClassName);
    Provider provider = (Provider)providerClass.newInstance();
    Security.insertProviderAt(provider, 1);
    try {
        // Load the private key
        PKCS8EncodedKeySpec privateKeySpec
        = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory
        = KeyFactory.getInstance("RSA");
        PrivateKey privateKey
        = keyFactory.generatePrivate(privateKeySpec);
        
        System.out.println("Loaded " + privateKey.getAlgorithm()
                   + " " + privateKey.getFormat()
                   + " private key.");
        return privateKey;
    } finally {
        // Dynamically deinstall the RSA provider 
        Security.removeProvider(provider.getName());
    }
    }
    
    /* ------------------------------------------------------------ */
    /**
     * Show a usage message.
     */
    static private void usage()
    {
        System.out.println(usageString);
        System.exit(23);
    }

    /* ------------------------------------------------------------ */
    /**
     * Load parameters from the given args and check usage.
     * Will exit on usage errors.
     * <p> Class variables are populated from the command line arguments
     * @param args Array of Strings from the command line.
     */
    private void loadParameters(String[] args)
    {
        for (int i = 0; (i < args.length) && args[i].startsWith("-"); i++)
        {
            String parameterName = args[i];
            if (parameterName.equalsIgnoreCase("-key"))
                privateKeyFile = new File(args[++i]);
            else if (parameterName.equalsIgnoreCase("-cert"))
                certFile = new File(args[++i]);
        else if (parameterName.equalsIgnoreCase("-keystore"))
                keyStoreFile = new File(args[++i]);
            else if (parameterName.equalsIgnoreCase("-storetype"))
                keyStoreType = args[++i];
            else if (parameterName.equalsIgnoreCase("-alias"))
                alias = args[++i];
            else if (parameterName.equalsIgnoreCase("-provider"))
                providerClassName = args[++i];
            else
            {
                System.err.println("Illegal parameter: " + parameterName);
                usage();
            }
        }

        // Check that mandatory fields have been populated
        if (privateKeyFile == null || certFile == null)
        {
            usage();
        }

        keyStorePassword = Password.getPassword("jetty.ssl.password",null,null);
        keyPassword = Password.getPassword("jetty.ssl.keypassword",
                                           null,
                                           keyStorePassword.toString());
    }
}
