// ========================================================================
// $Id: NotFoundServlet.java,v 1.4 2004/05/09 20:32:41 gregwilkins Exp $
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

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/* ------------------------------------------------------------ */
/** Not Found Servlet.
 * Utility servlet to protect a URI by always responding with 404.
 *
 * @version $Revision: 1.4 $
 * @author Greg Wilkins (gregw)
 */
public class NotFoundServlet extends HttpServlet
{
    /* ------------------------------------------------------------ */
    public void doPost(HttpServletRequest req, HttpServletResponse res) 
        throws ServletException, IOException
    {
        res.sendError(404);
    }
    
    /* ------------------------------------------------------------ */
    public void doGet(HttpServletRequest req, HttpServletResponse res) 
        throws ServletException, IOException
    {
        res.sendError(404);
    }
}
