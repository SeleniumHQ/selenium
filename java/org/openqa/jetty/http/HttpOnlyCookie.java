//========================================================================
//$Id: HttpOnlyCookie.java,v 1.1 2004/12/10 03:35:16 gregwilkins Exp $
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

package org.openqa.jetty.http;

import javax.servlet.http.Cookie;

/* ------------------------------------------------------------ */
/** HttpOnlyCookie.
 * 
 * This derivation of javax.servlet.http.Cookie can be used to indicate
 * that the microsoft httponly extension should be used.
 * The addSetCookie method on HttpFields checks for this type.
 * @author gregw
 *
 */
public class HttpOnlyCookie extends Cookie
{

    /* ------------------------------------------------------------ */
    /**
     * @param name
     * @param value
     */
    public HttpOnlyCookie(String name, String value)
    {
        super(name, value);
    }

}
