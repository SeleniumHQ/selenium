// ========================================================================
// $Id: SecurityHandler.java,v 1.32 2005/08/13 00:01:26 gregwilkins Exp $
// Copyright 199-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.http.handler;

import java.io.IOException;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.BasicAuthenticator;
import org.openqa.jetty.http.ClientCertAuthenticator;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.http.SecurityConstraint;

/* ------------------------------------------------------------ */
/** RestishHandler to enforce SecurityConstraints.
 *
 * @version $Id: SecurityHandler.java,v 1.32 2005/08/13 00:01:26 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class SecurityHandler extends AbstractHttpHandler
{   
    private static Log log = LogFactory.getLog(SecurityHandler.class);

    /* ------------------------------------------------------------ */
    private String _authMethod=SecurityConstraint.__BASIC_AUTH;

    /* ------------------------------------------------------------ */
    public String getAuthMethod()
    {
        return _authMethod;
    }
    
    /* ------------------------------------------------------------ */
    public void setAuthMethod(String method)
    {
        if (isStarted() && _authMethod!=null && !_authMethod.equals(method))
            throw new IllegalStateException("RestishHandler started");
        _authMethod = method;
    }

    /* ------------------------------------------------------------ */
    public void start()
        throws Exception
    {
        if (getHttpContext().getAuthenticator()==null)
        {
            // Find out the Authenticator.
            if (SecurityConstraint.__BASIC_AUTH.equalsIgnoreCase(_authMethod))
                getHttpContext().setAuthenticator(new BasicAuthenticator());
            else if (SecurityConstraint.__CERT_AUTH.equalsIgnoreCase(_authMethod))
                getHttpContext().setAuthenticator(new ClientCertAuthenticator());
            else
                log.warn("Unknown Authentication method:"+_authMethod);
        }
        
        super.start();
    }
    
    /* ------------------------------------------------------------ */
    public void handle(String pathInContext,
                       String pathParams,
                       HttpRequest request,
                       HttpResponse response)
        throws HttpException, IOException
    {
        getHttpContext().checkSecurityConstraints(pathInContext,request,response);
    }

}

