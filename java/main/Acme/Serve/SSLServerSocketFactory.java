/* MediaChest $RCSfile: SSLServerSocketFactory.java,v $
 * Copyright (C) 2002 Dmitriy Rogatkin.  All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 *  ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE FOR
 *  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 *  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * $Id: SSLServerSocketFactory.java,v 1.1 2004/11/03 22:17:26 jwang Exp $
 */

package Acme.Serve;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.util.Map;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.Security;
import java.security.cert.CertificateException;
import javax.net.ServerSocketFactory;
import javax.net.ssl.SSLServerSocket;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.HandshakeCompletedListener;
import javax.net.ssl.HandshakeCompletedEvent;

import com.sun.net.ssl.KeyManagerFactory;
import com.sun.net.ssl.SSLContext;
import com.sun.net.ssl.TrustManagerFactory;


/**
 * Ref implementation of socket factory used by HTTP server Serve 
 * @author Dmitriy Rogatkin
 */

public class SSLServerSocketFactory
    implements Acme.Serve.Serve.SocketFactory {


	public static final String ARG_ALGORITHM = "algorithm"; // SUNX509
	public static final String ARG_CLIENTAUTH = "clientAuth"; // false
	public static final String ARG_KEYSTOREFILE = "keystoreFile"; // System.getProperty("user.home") + File.separator + ".keystore";
	public static final String ARG_KEYSTOREPASS = "keystorePass"; // KEYSTOREPASS
	public static final String ARG_KEYSTORETYPE = "keystoreType"; // KEYSTORETYPE
	public static final String ARG_PROTOCOL = "protocol"; // TLS
	
	public static final String ARG_BACKLOG = "backlog";
		public static final String ARG_IFADDRESS = "ifAddress";
			public static final String ARG_PORT = "port";
	
    public static final String PROTOCOL_HANDLER =
        "com.sun.net.ssl.internal.www.protocol";


    /**
     * The name of the system property containing a "|" delimited list of
     * protocol handler packages.
     */
    public static final String PROTOCOL_PACKAGES =
        "java.protocol.handler.pkgs";

    /**
     * Certificate encoding algorithm to be used.
     */
    public final static String SUNX509 = "SunX509";
	
	/**
	 *  default SSL port
	 */
	public final static int PORT = 8443;

	/**
	 *  default backlog
	 */
	public final static int BACKLOG = 1000;

    /**
     * Storeage type of the key store file to be used.
     */
    public final static String KEYSTORETYPE = "JKS";

    /**
     * SSL protocol variant to use.
     */
    public final static String TLS = "TLS";

	/**
	 * SSL protocol variant to use.
	 */
	public static final String protocol = "TLS";

	/**
     * Pathname to the key store file to be used.
     */
    protected String keystoreFile =
        System.getProperty("user.home") + File.separator + ".keystore";

    public String getKeystoreFile() {
        return (this.keystoreFile);
    }

    /**
     * Password for accessing the key store file.
     */
    private static final String KEYSTOREPASS = "123456";


    /**
     * Return a server socket that uses all network interfaces on the host,
     * and is bound to a specified port.  The socket is configured with the
     * socket options (such as accept timeout) given to this factory.
     *
     * @param creation parameters Map, default will be used if not defined
     *
     * @exception IOException if an input/output or network error occurs
     */
    public ServerSocket createSocket(Map arguments) throws IOException {
		ServerSocket socket = null;
		javax.net.ssl.SSLServerSocketFactory sslSoc = null;		
		// init keystore
		KeyStore keyStore = null;
		FileInputStream istream = null;
		String keystorePass = null;
		
        try {
			String keystoreType = (String)arguments.get(ARG_KEYSTORETYPE);
			if (keystoreType == null)
				keystoreType = KEYSTORETYPE;
            keyStore = KeyStore.getInstance(keystoreType);
			String keystoreFile = (String)arguments.get(ARG_KEYSTOREFILE);
			if (keystoreFile == null)
				keystoreFile = System.getProperty("user.home") + File.separator + ".keystore";
            istream = new FileInputStream(keystoreFile);
			keystorePass = (String)arguments.get(ARG_KEYSTOREPASS);
			if (keystorePass == null)
				keystorePass = KEYSTOREPASS;
            keyStore.load(istream, keystorePass.toCharArray());
        } catch (Exception e) {
            System.err.println("initKeyStore:  " + e);
            e.printStackTrace();
            throw new IOException(e.toString());
        } finally {
            if ( istream != null )
                istream.close();
        }
		
		try {

            // Register the JSSE security Provider (if it is not already there)
            try {
                Security.addProvider((java.security.Provider)
                    Class.forName("com.sun.net.ssl.internal.ssl.Provider").newInstance());
            } catch (Throwable t) {				
                t.printStackTrace();
				throw new IOException(t.toString());
            }

            // Create an SSL context used to create an SSL socket factory
			String protocol = (String)arguments.get(ARG_PROTOCOL);
			if (protocol == null)
				protocol = TLS;
            SSLContext context = SSLContext.getInstance(protocol);

            // Create the key manager factory used to extract the server key
			String algorithm = (String)arguments.get(ARG_ALGORITHM);
			if (algorithm == null)
				algorithm = SUNX509;
            KeyManagerFactory keyManagerFactory =
                KeyManagerFactory.getInstance(algorithm);
            keyManagerFactory.init(keyStore, keystorePass.toCharArray());

            // Initialize the context with the key managers
            context.init(keyManagerFactory.getKeyManagers(), null,
                         new java.security.SecureRandom());

            // Create the proxy and return
            sslSoc = context.getServerSocketFactory();

        } catch (Exception e) {
            System.err.println("initProxy:  " + e);
            e.printStackTrace();
            throw new IOException(e.toString());
        }
		
		int port = PORT;
		if (arguments.get(ARG_PORT) != null)
			port = ((Integer)arguments.get(ARG_PORT)).intValue();
		if (arguments.get(ARG_BACKLOG) == null)
			if (arguments.get(ARG_IFADDRESS) == null)
				socket = sslSoc.createServerSocket(port);
			else
				socket = sslSoc.createServerSocket(port, BACKLOG, InetAddress. getByName((String)arguments.get(ARG_IFADDRESS)) );
		else if (arguments.get(ARG_IFADDRESS) == null)
			socket = sslSoc.createServerSocket(port, ((Integer)arguments.get(ARG_BACKLOG)).intValue());
		else
			socket = sslSoc.createServerSocket(port, ((Integer)arguments.get(ARG_BACKLOG)).intValue(), InetAddress. getByName((String)arguments.get(ARG_IFADDRESS)) );
		
        initServerSocket(socket, arguments.get(ARG_IFADDRESS) != null);
        return (socket);

    }

    /**
     * Register our URLStreamHandler for the "https:" protocol.
     */
    protected static void initHandler() {

        String packages = System.getProperty(PROTOCOL_PACKAGES);
        if (packages == null)
            packages = PROTOCOL_HANDLER;
        else if (packages.indexOf(PROTOCOL_HANDLER) < 0)
            packages += "|" + PROTOCOL_HANDLER;
        System.setProperty(PROTOCOL_PACKAGES, packages);

    }
	
	static {
		initHandler();
	}

    /**
     * Set the requested properties for this server socket.
     *
     * @param ssocket The server socket to be configured
     */
    protected void initServerSocket(ServerSocket ssocket, boolean clientAuth) {

        SSLServerSocket socket = (SSLServerSocket) ssocket;

        // Enable all available cipher suites when the socket is connected
        String cipherSuites[] = socket.getSupportedCipherSuites();
        socket.setEnabledCipherSuites(cipherSuites);

        // Set client authentication if necessary
        socket.setNeedClientAuth(clientAuth);

    }

}
