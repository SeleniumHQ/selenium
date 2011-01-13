// ========================================================================
// $Id: BasicAuthenticator.java,v 1.17 2005/08/13 00:01:24 gregwilkins Exp $
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

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.B64Code;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.StringUtil;

/* ------------------------------------------------------------ */
/** BASIC authentication.
 *
 * @version $Id: BasicAuthenticator.java,v 1.17 2005/08/13 00:01:24 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class BasicAuthenticator implements Authenticator
{
    private static Log log = LogFactory.getLog(BasicAuthenticator.class);

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
        // Get the user if we can
        Principal user=null;
        String credentials = request.getField(HttpFields.__Authorization);
        
        if (credentials!=null )
        {
            try
            {
                if(log.isDebugEnabled())log.debug("Credentials: "+credentials);
                credentials = credentials.substring(credentials.indexOf(' ')+1);
                credentials = B64Code.decode(credentials,StringUtil.__ISO_8859_1);
                int i = credentials.indexOf(':');
                String username = credentials.substring(0,i);
                String password = credentials.substring(i+1);
                user = realm.authenticate(username,password,request);
                
                if (user==null)
                    log.warn("AUTH FAILURE: user "+username);
                else
                {
                    request.setAuthType(SecurityConstraint.__BASIC_AUTH);
                    request.setAuthUser(username);
                    request.setUserPrincipal(user);                
                }
            }
            catch (Exception e)
            {
                log.warn("AUTH FAILURE: "+e.toString());
                LogSupport.ignore(log,e);
            }
        }

        // Challenge if we have no user
        if (user==null && response!=null)
            sendChallenge(realm,response);
        
        return user;
    }
    
    /* ------------------------------------------------------------ */
    public String getAuthMethod()
    {
        return SecurityConstraint.__BASIC_AUTH;
    }

    /* ------------------------------------------------------------ */
    public void sendChallenge(UserRealm realm,
                              HttpResponse response)
        throws IOException
    {
        response.setField(HttpFields.__WwwAuthenticate,
                          "basic realm=\""+realm.getName()+'"');
        response.sendError(HttpResponse.__401_Unauthorized);
    }
    
}
    
