// ========================================================================
// $Id: SslListener.java,v 1.8 2006/11/22 20:21:30 gregwilkins Exp $
// Copyright 2000-2004 Mort Bay Consulting Pty. Ltd.
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
//

package org.openqa.jetty.http;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.security.KeyStore;
import java.security.Security;
import java.security.cert.X509Certificate;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLException;
import javax.net.ssl.SSLPeerUnverifiedException;
import javax.net.ssl.SSLServerSocket;
import javax.net.ssl.SSLServerSocketFactory;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocket;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.jetty.servlet.ServletSSL;
import org.openqa.jetty.util.InetAddrPort;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.Password;
import org.openqa.jetty.util.Resource;

/* ------------------------------------------------------------ */
/**
 * JSSE Socket Listener.
 * 
 * This is heavily based on the work from Court Demas, which in turn is based on the work from Forge
 * Research.
 * 
 * @version $Id: SslListener.java,v 1.8 2006/11/22 20:21:30 gregwilkins Exp $
 * @author Greg Wilkins (gregw@mortbay.com)
 * @author Court Demas (court@kiwiconsulting.com)
 * @author Forge Research Pty Ltd ACN 003 491 576
 * @author Jan Hlavaty
 */
public class SslListener extends SocketListener
{
    private static Log log = LogFactory.getLog(SslListener.class);
    
    /** Default value for the cipher Suites. */
    private String cipherSuites[] = null;

    /** Default value for the keystore location path. */
    public static final String DEFAULT_KEYSTORE = System.getProperty("user.home") + File.separator
            + ".keystore";

    /** String name of keystore password property. */
    public static final String PASSWORD_PROPERTY = "jetty.ssl.password";

    /** String name of key password property. */
    public static final String KEYPASSWORD_PROPERTY = "jetty.ssl.keypassword";

    /**
     * The name of the SSLSession attribute that will contain any cached information.
     */
    static final String CACHED_INFO_ATTR = CachedInfo.class.getName();


    private String _keystore=DEFAULT_KEYSTORE ;
    private transient Password _password;
    private transient Password _keypassword;
    private boolean _needClientAuth = false; // Set to true if we require client certificate authentication.
    private boolean _wantClientAuth = false; // Set to true if we would like client certificate authentication.
    private String _protocol= "TLS";
    private String _algorithm = (Security.getProperty("ssl.KeyManagerFactory.algorithm")==null?"SunX509":Security.getProperty("ssl.KeyManagerFactory.algorithm")); // cert algorithm
    private String _keystoreType = "JKS"; // type of the key store
    private String _provider = null;



    /* ------------------------------------------------------------ */
    /**
     * Constructor.
     */
    public SslListener()
    {
        super();
        setDefaultScheme(HttpMessage.__SSL_SCHEME);
    }

    /* ------------------------------------------------------------ */
    /**
     * Constructor.
     * 
     * @param p_address
     */
    public SslListener(InetAddrPort p_address)
    {
        super(p_address);
        if (p_address.getPort() == 0)
        {
            p_address.setPort(443);
            setPort(443);
        }
        setDefaultScheme(HttpMessage.__SSL_SCHEME);
    }

    /* ------------------------------------------------------------ */    
    public String[] getCipherSuites() {
        return cipherSuites;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @param cipherSuites
     * author Tony Jiang
     */
    public void setCipherSuites(String[] cipherSuites) {
        this.cipherSuites = cipherSuites;
    }

    /* ------------------------------------------------------------ */
    public void setPassword(String password)
    {
        _password = Password.getPassword(PASSWORD_PROPERTY,password,null);
    }

    /* ------------------------------------------------------------ */
    public void setKeyPassword(String password)
    {
        _keypassword = Password.getPassword(KEYPASSWORD_PROPERTY,password,null);
    }

    /* ------------------------------------------------------------ */
    public String getAlgorithm() 
    {
        return (this._algorithm);
    }

    /* ------------------------------------------------------------ */
    public void setAlgorithm(String algorithm) 
    {
        this._algorithm = algorithm;
    }

    /* ------------------------------------------------------------ */
    public String getProtocol() 
    {
        return _protocol;
    }

    /* ------------------------------------------------------------ */
    public void setProtocol(String protocol) 
    {
        _protocol = protocol;
    }

    /* ------------------------------------------------------------ */
    public void setKeystore(String keystore)
    {
        _keystore = keystore;
    }
    
    /* ------------------------------------------------------------ */
    public String getKeystore()
    {
        return _keystore;
    }
    
    /* ------------------------------------------------------------ */
    public String getKeystoreType() 
    {
        return (_keystoreType);
    }

    /* ------------------------------------------------------------ */
    public void setKeystoreType(String keystoreType) 
    {
        _keystoreType = keystoreType;
    }
    
    /* ------------------------------------------------------------ */
    /**
     * Set the value of the needClientAuth property
     * 
     * @param needClientAuth true iff we require client certificate authentication.
     */
    public void setNeedClientAuth(boolean needClientAuth)
    {
        _needClientAuth = needClientAuth;
    }

    /* ------------------------------------------------------------ */
    public boolean getNeedClientAuth()
    {
        return _needClientAuth;
    }
    
    /* ------------------------------------------------------------ */
    /**
     * Set the value of the needClientAuth property
     * 
     * @param wantClientAuth true iff we would like client certificate authentication.
     */
    public void setWantClientAuth(boolean wantClientAuth)
    {
        _wantClientAuth = wantClientAuth;
    }

    /* ------------------------------------------------------------ */
    public boolean getWantClientAuth()
    {
        return _wantClientAuth;
    }

    /* ------------------------------------------------------------ */
    /**
     * By default, we're integral, given we speak SSL. But, if we've been told about an integral
     * port, and said port is not our port, then we're not. This allows separation of listeners
     * providing INTEGRAL versus CONFIDENTIAL constraints, such as one SSL listener configured to
     * require client certs providing CONFIDENTIAL, whereas another SSL listener not requiring
     * client certs providing mere INTEGRAL constraints.
     */
    public boolean isIntegral(HttpConnection connection)
    {
        final int integralPort = getIntegralPort();
        return integralPort == 0 || integralPort == getPort();
    }

    /* ------------------------------------------------------------ */
    /**
     * By default, we're confidential, given we speak SSL. But, if we've been told about an
     * confidential port, and said port is not our port, then we're not. This allows separation of
     * listeners providing INTEGRAL versus CONFIDENTIAL constraints, such as one SSL listener
     * configured to require client certs providing CONFIDENTIAL, whereas another SSL listener not
     * requiring client certs providing mere INTEGRAL constraints.
     */
    public boolean isConfidential(HttpConnection connection)
    {
        final int confidentialPort = getConfidentialPort();
        return confidentialPort == 0 || confidentialPort == getPort();
    }

    /* ------------------------------------------------------------ */
    protected SSLServerSocketFactory createFactory() 
    	throws Exception
    {
        SSLContext context;
        if (_provider == null) {
			context = SSLContext.getInstance(_protocol);
		} else {
			context = SSLContext.getInstance(_protocol, _provider);
		}

        KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(_algorithm);        
        KeyStore keyStore = KeyStore.getInstance(_keystoreType);
        keyStore.load(Resource.newResource(_keystore).getInputStream(), _password.toString().toCharArray());
        keyManagerFactory.init(keyStore,_keypassword.toString().toCharArray());
        
        context.init(keyManagerFactory.getKeyManagers(), null, new java.security.SecureRandom());

        return context.getServerSocketFactory();
    }

    /* ------------------------------------------------------------ */
    /**
     * @param p_address
     * @param p_acceptQueueSize
     * @return @exception IOException
     */
    protected ServerSocket newServerSocket(InetAddrPort p_address, int p_acceptQueueSize)
            throws IOException
    {
        SSLServerSocketFactory factory = null;
        SSLServerSocket socket = null;

        try
        {
            factory = createFactory();

            if (p_address == null)
            {
                socket = (SSLServerSocket) factory.createServerSocket(0, p_acceptQueueSize);
            }
            else
            {
                socket = (SSLServerSocket) factory.createServerSocket(p_address.getPort(),
                        p_acceptQueueSize, p_address.getInetAddress());
            }

            if (_needClientAuth)
                socket.setNeedClientAuth(true);
            else if (_wantClientAuth)
                socket.setWantClientAuth(true);
            
            if(cipherSuites != null && cipherSuites.length >0) {
            	socket.setEnabledCipherSuites(cipherSuites);
            	for ( int i=0; i<cipherSuites.length; i++ ) {
                    log.debug("SslListener enabled ciphersuite: " + cipherSuites[i]);
                }            
            }
        }
        catch (IOException e)
        {
            throw e;
        }
        catch (Exception e)
        {
            log.warn(LogSupport.EXCEPTION, e);
            throw new IOException("Could not create JsseListener: " + e.toString());
        }
        return socket;
    }

    /* ------------------------------------------------------------ */
    /**
     * @param p_serverSocket
     * @return @exception IOException
     */
    protected Socket accept(ServerSocket p_serverSocket) throws IOException
    {
        try
        {
            SSLSocket s = (SSLSocket) p_serverSocket.accept();
            if (getMaxIdleTimeMs() > 0) s.setSoTimeout(getMaxIdleTimeMs());
            s.startHandshake(); // block until SSL handshaking is done
            return s;
        }
        catch (SSLException e)
        {
            log.warn(LogSupport.EXCEPTION, e);
            throw new IOException(e.getMessage());
        }
    }

    /* ------------------------------------------------------------ */
    /**
     * Allow the Listener a chance to customise the request. before the server does its stuff. <br>
     * This allows the required attributes to be set for SSL requests. <br>
     * The requirements of the Servlet specs are:
     * <ul>
     * <li>an attribute named "javax.servlet.request.cipher_suite" of type String.</li>
     * <li>an attribute named "javax.servlet.request.key_size" of type Integer.</li>
     * <li>an attribute named "javax.servlet.request.X509Certificate" of type
     * java.security.cert.X509Certificate[]. This is an array of objects of type X509Certificate,
     * the order of this array is defined as being in ascending order of trust. The first
     * certificate in the chain is the one set by the client, the next is the one used to
     * authenticate the first, and so on.</li>
     * </ul>
     * 
     * @param socket The Socket the request arrived on. This should be a javax.net.ssl.SSLSocket.
     * @param request HttpRequest to be customised.
     */
    protected void customizeRequest(Socket socket, HttpRequest request)
    {
        super.customizeRequest(socket, request);

        if (!(socket instanceof javax.net.ssl.SSLSocket)) return; // I'm tempted to let it throw an
                                                                  // exception...

        try
        {
            SSLSocket sslSocket = (SSLSocket) socket;
            SSLSession sslSession = sslSocket.getSession();
            String cipherSuite = sslSession.getCipherSuite();
            Integer keySize;
            X509Certificate[] certs;

            CachedInfo cachedInfo = (CachedInfo) sslSession.getValue(CACHED_INFO_ATTR);
            if (cachedInfo != null)
            {
                keySize = cachedInfo.getKeySize();
                certs = cachedInfo.getCerts();
            }
            else
            {
                keySize = new Integer(ServletSSL.deduceKeyLength(cipherSuite));
                certs = getCertChain(sslSession);
                cachedInfo = new CachedInfo(keySize, certs);
                sslSession.putValue(CACHED_INFO_ATTR, cachedInfo);
            }

            if (certs != null)
                request.setAttribute("javax.servlet.request.X509Certificate", certs);
            else if (_needClientAuth) // Sanity check
                    throw new HttpException(HttpResponse.__403_Forbidden);

            request.setAttribute("javax.servlet.request.cipher_suite", cipherSuite);
            request.setAttribute("javax.servlet.request.key_size", keySize);
        }
        catch (Exception e)
        {
            log.warn(LogSupport.EXCEPTION, e);
        }
    }

    /**
     * Return the chain of X509 certificates used to negotiate the SSL Session.
     * <p>
     * Note: in order to do this we must convert a javax.security.cert.X509Certificate[], as used by
     * JSSE to a java.security.cert.X509Certificate[],as required by the Servlet specs.
     * 
     * @param sslSession the javax.net.ssl.SSLSession to use as the source of the cert chain.
     * @return the chain of java.security.cert.X509Certificates used to negotiate the SSL
     *         connection. <br>
     *         Will be null if the chain is missing or empty.
     */
    private static X509Certificate[] getCertChain(SSLSession sslSession)
    {
        try
        {
            javax.security.cert.X509Certificate javaxCerts[] = sslSession.getPeerCertificateChain();
            if (javaxCerts == null || javaxCerts.length == 0) return null;

            int length = javaxCerts.length;
            X509Certificate[] javaCerts = new X509Certificate[length];

            java.security.cert.CertificateFactory cf = java.security.cert.CertificateFactory
                    .getInstance("X.509");
            for (int i = 0; i < length; i++)
            {
                byte bytes[] = javaxCerts[i].getEncoded();
                ByteArrayInputStream stream = new ByteArrayInputStream(bytes);
                javaCerts[i] = (X509Certificate) cf.generateCertificate(stream);
            }

            return javaCerts;
        }
        catch (SSLPeerUnverifiedException pue)
        {
            return null;
        }
        catch (Exception e)
        {
            log.warn(LogSupport.EXCEPTION, e);
            return null;
        }
    }

    /**
     * Simple bundle of information that is cached in the SSLSession. Stores the effective keySize
     * and the client certificate chain.
     */
    private class CachedInfo
    {
        private Integer _keySize;
        private X509Certificate[] _certs;

        CachedInfo(Integer keySize, X509Certificate[] certs)
        {
            this._keySize = keySize;
            this._certs = certs;
        }

        Integer getKeySize()
        {
            return _keySize;
        }

        X509Certificate[] getCerts()
        {
            return _certs;
        }
    }

	public String getProvider() {
		return _provider;
	}

	public void setProvider(String _provider) {
		this._provider = _provider;
	}
}
