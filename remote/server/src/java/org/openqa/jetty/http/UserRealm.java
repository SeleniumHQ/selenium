// ========================================================================
// $Id: UserRealm.java,v 1.16 2006/02/28 12:45:01 gregwilkins Exp $
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

/* ------------------------------------------------------------ */
/** User Realm.
 *
 * This interface should be specialized to provide specific user
 * lookup and authentication using arbitrary methods.
 *
 * For SSO implementation sof UserRealm should also implement SSORealm.
 *
 * @see SSORealm
 * @version $Id: UserRealm.java,v 1.16 2006/02/28 12:45:01 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public interface UserRealm
{
    /* ------------------------------------------------------------ */
    public String getName();

    /* ------------------------------------------------------------ */
    /** Get the principal for a username.
     * This method is not guaranteed to return a Principal for non-authenticated users.
     */
    public Principal getPrincipal(String username);
    
    /* ------------------------------------------------------------ */
    /** Authenticate a users credentials.
     * Implementations of this method may adorn the calling context to
     * assoicate it with the authenticated principal (eg ThreadLocals). If
     * such context associations are made, they should be considered valid
     * until a UserRealm.deAuthenticate(UserPrincipal) call is made for this
     * UserPrincipal.
     * @param username The username. 
     * @param credentials The user credentials, normally a String password. 
     * @param request The request to be authenticated. Additional
     * parameters may be extracted or set on this request as needed
     * for the authentication mechanism (none required for BASIC and
     * FORM authentication).
     * @return The authenticated UserPrincipal.
     */
    public Principal authenticate(String username,Object credentials,HttpRequest request);

    /* ------------------------------------------------------------ */
    /** Re Authenticate a Principal.
     * Authenicate a principal that has previously been return from the authenticate method.
     * 
     * Implementations of this method may adorn the calling context to
     * assoicate it with the authenticated principal (eg ThreadLocals). If
     * such context associations are made, they should be considered valid
     * until a UserRealm.deAuthenticate(UserPrincipal) call is made for this
     * UserPrincipal.
     *
     * @return True if this user is still authenticated.
     */
    public boolean reauthenticate(Principal user);
    
    /* ------------------------------------------------------------ */
    /** Check if the user is in a role. 
     * @param role A role name.
     * @return True if the user can act in that role.
     */
    public boolean isUserInRole(Principal user, String role);
    
    /* ------------------------------------------------------------ */
    /** Dissassociate the calling context with a Principal.
     * This method is called when the calling context is not longer
     * associated with the Principal.  It should be used by an implementation
     * to remove context associations such as ThreadLocals.
     * The UserPrincipal object remains authenticated, as it may be
     * associated with other contexts.
     * @param user A UserPrincipal allocated from this realm.
     */
    public void disassociate(Principal user);
    
    /* ------------------------------------------------------------ */
    /** Push role onto a Principal.
     * This method is used to add a role to an existing principal.
     * @param user An existing UserPrincipal or null for an anonymous user.
     * @param role The role to add.
     * @return A new UserPrincipal object that wraps the passed user, but
     * with the added role.
     */
    public Principal pushRole(Principal user, String role);


    /* ------------------------------------------------------------ */
    /** Pop role from a Principal.
     * @param user A UserPrincipal previously returned from pushRole
     * @return The principal without the role.  Most often this will be the
     * original UserPrincipal passed.
     */
    public Principal popRole(Principal user);

    /* ------------------------------------------------------------ */
    /** logout a user Principal.
     * Called by authentication mechanisms (eg FORM) that can detect logout.
     * @param user A Principal previously returned from this realm
     */
    public void logout(Principal user);
    
}
