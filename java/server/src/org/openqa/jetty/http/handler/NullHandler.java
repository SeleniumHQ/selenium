// ========================================================================
// $Id: NullHandler.java,v 1.17 2004/05/09 20:32:06 gregwilkins Exp $
// Copyright 1999-2004 Mort Bay Consulting Pty. Ltd.
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

import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;



/* ------------------------------------------------------------ */
/** Abstract HTTP RestishHandler.
 * @version $Id: NullHandler.java,v 1.17 2004/05/09 20:32:06 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class NullHandler extends AbstractHttpHandler
{
    /* 
     * @see org.openqa.jetty.http.HttpHandler#handle(java.lang.String, java.lang.String, org.openqa.jetty.http.HttpRequest, org.openqa.jetty.http.HttpResponse)
     */
    public void handle(String pathInContext, String pathParams, HttpRequest request, HttpResponse response) throws HttpException, IOException
    {
    }
}




