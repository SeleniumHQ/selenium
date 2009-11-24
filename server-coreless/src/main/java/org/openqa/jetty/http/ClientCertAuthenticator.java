// ========================================================================
// $Id: ClientCertAuthenticator.java,v 1.15 2006/02/28 12:45:01 gregwilkins Exp $
// Copyright 2002-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.http;

import java.io.IOException;
import java.security.Principal;

import javax.net.ssl.SSLSocket;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

/* ------------------------------------------------------------ */
/** Client Certificate Authenticator.
 * This Authenticator uses a client certificate to authenticate the user.
 * Each client certificate supplied is tried against the realm using the
 * Principal name as the username and a string representation of the
 * certificate as the credential.
 * @version $Id: ClientCertAuthenticator.java,v 1.15 2006/02/28 12:45:01 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class ClientCertAuthenticator implements Authenticator
{
    private static Log log = LogFactory.getLog(ClientCertAuthenticator.class);

    private int _maxHandShakeSeconds =60;
    
    /* ------------------------------------------------------------ */
    public ClientCertAuthenticator()
    {
        log.warn("Client Cert Authentication is EXPERIMENTAL");
    }
    
    /* ------------------------------------------------------------ */
    public int getMaxHandShakeSeconds()
    {
        return _maxHandShakeSeconds;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @param maxHandShakeSeconds Maximum time to wait for SSL handshake if
     * Client certification is required.
     */
    public void setMaxHandShakeSeconds(int maxHandShakeSeconds)
    {
        _maxHandShakeSeconds = maxHandShakeSeconds;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @return UserPrinciple if authenticated or null if not. If
     * Authentication fails, then the authenticator may have committed
     * the response as an auth challenge or redirect.
     * @exception IOException 
     */
    public Principal authenticate(UserRealm realm,
                                  String pathInContext,
                                  HttpRequest request,
                                  HttpResponse response)
        throws IOException
    {
        java.security.cert.X509Certificate[] certs =
            (java.security.cert.X509Certificate[])
            request.getAttribute("javax.servlet.request.X509Certificate");
            
        if (response!=null && (certs==null || certs.length==0 || certs[0]==null))
        {
            // No certs available so lets try and force the issue
            
            // Get the SSLSocket
            Object s = HttpConnection.getHttpConnection().getConnection();
            if (!(s instanceof SSLSocket))
                return null;
            SSLSocket socket = (SSLSocket)s;
            
            if (!socket.getNeedClientAuth())
            {
                // Need to re-handshake
                socket.setNeedClientAuth(true);
                socket.startHandshake();

                // Need to wait here - but not forever. The Handshake
                // Listener API does not look like a good option to
                // avoid waiting forever.  So we will take a slightly
                // busy timelimited approach. For now:
                for (int i=(_maxHandShakeSeconds*4);i-->0;)
                {
                    certs = (java.security.cert.X509Certificate[])
                        request.getAttribute("javax.servlet.request.X509Certificate");
                    if (certs!=null && certs.length>0 && certs[0]!=null)
                        break;
                    try{Thread.sleep(250);} catch (Exception e) {break;}
                }
            }
        }

        if (certs==null || certs.length==0 || certs[0]==null)
            return null;
        
        Principal principal = certs[0].getSubjectDN();
        if (principal==null)
            principal=certs[0].getIssuerDN();
        String username=principal==null?"clientcert":principal.getName();
        
        Principal user = realm.authenticate(username,certs,request);
        
        request.setAuthType(SecurityConstraint.__CERT_AUTH);
        if (user!=null) 
            request.setAuthUser(user.getName());
        request.setUserPrincipal(user);                
        return user;
    }
    
    /* ------------------------------------------------------------ */
    public String getAuthMethod()
    {
        return SecurityConstraint.__CERT_AUTH;
    }

}
