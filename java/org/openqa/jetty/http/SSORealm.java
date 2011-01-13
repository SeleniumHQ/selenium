// ========================================================================
// $Id: SSORealm.java,v 1.4 2004/05/09 20:31:40 gregwilkins Exp $
// Copyright 1996-2004 Mort Bay Consulting Pty. Ltd.
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

import java.security.Principal;

import org.openqa.jetty.util.Credential;

/* ------------------------------------------------------------ */
/** Single Sign On Realm.
 * This interface is a mix-in interface for the UserRealm interface. If an
 * implementation of UserRealm also implements SSORealm, then single signon
 * is supported for that realm.
 
 * @see UserRealm
 * @version $Id: SSORealm.java,v 1.4 2004/05/09 20:31:40 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */

public interface SSORealm
{
    /** Get SSO credentials.
     * This call is used by an authenticator to check if a SSO exists for a request.
     * If SSO authentiation is successful, the requests UserPrincipal and
     * AuthUser fields are set.  If available, the credential used to
     * authenticate the user is returned. If recoverable credentials are not required then
     * null may be return.
     * @param request The request to SSO.
     * @param response The response to SSO.
     * @return A credential if available for SSO authenticated requests.
     */
    public Credential getSingleSignOn(HttpRequest request,
                                      HttpResponse response);
    
    /** Set SSO principal and credential.
     * This call is used by an authenticator to inform the SSO mechanism that
     * a user has signed on. The SSO mechanism should record the principal
     * and credential and update the response with any cookies etc. required. 
     * @param request The authenticated request.
     * @param response The authenticated response/
     * @param principal The principal that has been authenticated.
     * @param credential The credentials used to authenticate.
     */
    
    public void setSingleSignOn(HttpRequest request,
                                HttpResponse response,
                                Principal principal,
                                Credential credential);
    
    /** Clear SSO for user.
     * @param username The user to clear.
     */
    public void clearSingleSignOn(String username);
}
