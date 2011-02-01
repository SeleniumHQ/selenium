//========================================================================
//$Id: DigestAuthenticator.java,v 1.1 2005/06/22 10:01:56 gregwilkins Exp $
//Copyright 2004 Mort Bay Consulting Pty. Ltd.
//------------------------------------------------------------------------
//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at 
//http://www.apache.org/licenses/LICENSE-2.0
//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.
//========================================================================

package org.openqa.jetty.jetty.servlet;

import java.io.IOException;

import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.http.UserRealm;

/* ------------------------------------------------------------ */
/** DigestAuthenticator.
 * @author gregw
 *
 */
public class DigestAuthenticator extends org.openqa.jetty.http.DigestAuthenticator
{

    /* ------------------------------------------------------------ */
    public void sendChallenge(UserRealm realm,
                              HttpRequest request,
                              HttpResponse response,
                              boolean stale)
        throws IOException
    {
        response.setField(HttpFields.__WwwAuthenticate,
			    "Digest realm=\""+realm.getName()+
			    "\", domain=\""+
			    response.getHttpContext().getContextPath() +
			    "\", nonce=\""+newNonce(request)+
			    "\", algorithm=MD5, qop=\"auth\"" + (useStale?(" stale="+stale):"")
                          );

        ServletHttpResponse sresponse = (ServletHttpResponse) response.getWrapper();
        if (sresponse!=null)
            sresponse.sendError(HttpResponse.__401_Unauthorized);
        else
            response.sendError(HttpResponse.__401_Unauthorized);
    }
}
