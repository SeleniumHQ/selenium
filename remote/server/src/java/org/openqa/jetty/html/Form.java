// ========================================================================
// $Id: Form.java,v 1.4 2004/05/09 20:31:28 gregwilkins Exp $
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

package org.openqa.jetty.html;
import java.io.IOException;
import java.io.Writer;

import org.openqa.jetty.http.HttpFields;

/* -------------------------------------------------------------------- */
/** HTML Form.
 * The specialized Block can contain HTML Form elements as well as
 * any other HTML elements
 */
public class Form extends Block
{
    public static final String encodingWWWURL = HttpFields.__WwwFormUrlEncode;
    public static final String encodingMultipartForm = "multipart/form-data";
    private String method="POST";
    
    /* ----------------------------------------------------------------- */
    /** Constructor.
     */
    public Form()
    {
        super("form");
    }

    /* ----------------------------------------------------------------- */
    /** Constructor.
     * @param submitURL The URL to submit the form to
     */
    public Form(String submitURL)
    {
        super("form");
        action(submitURL);
    }

    /* ----------------------------------------------------------------- */
    /** Constructor.
     * @param submitURL The URL to submit the form to
     */
    public Form action(String submitURL)
    {
        attribute("action",submitURL);
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /** Set the form target.
     */
    public Form target(String t)
    {
        attribute("target",t);
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /** Set the form method.
     */
    public Form method(String m)
    {
        method=m;
        return this;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the form encoding type.
     */
    public Form encoding(String encoding){
        attribute("enctype", encoding);
        return this;
    }
    /* ----------------------------------------------------------------- */
    public void write(Writer out)
         throws IOException
    {
        attribute("method",method);
        super.write(out);
    }
}




