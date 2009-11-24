// ========================================================================
// $Id: MultiPartResponse.java,v 1.6 2004/05/09 20:32:41 gregwilkins Exp $
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

package org.openqa.jetty.servlet;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;



/* ================================================================ */
/** Handle a multipart MIME response.
 *
 *
 * @version $Id: MultiPartResponse.java,v 1.6 2004/05/09 20:32:41 gregwilkins Exp $
 * @author Greg Wilkins
 * @author Jim Crossley
*/
public class MultiPartResponse extends org.openqa.jetty.http.MultiPartResponse
{
    /* ------------------------------------------------------------ */
    /** MultiPartResponse constructor.
     * @param response The ServletResponse to which this multipart
     *                 response will be sent.
     */
    public MultiPartResponse(HttpServletResponse response)
         throws IOException
    {
        super(response.getOutputStream());
        response.setContentType("multipart/mixed;boundary="+getBoundary());
    }
    
};




