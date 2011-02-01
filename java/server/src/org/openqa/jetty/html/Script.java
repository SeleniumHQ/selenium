// ========================================================================
// $Id: Script.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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


/* -------------------------------------------------------------------- */
/** HTML Script Block.
 */
public class Script extends Block
{
    public static final String javascript = "JavaScript";

    /* ------------------------------------------------------------ */
    /** Construct a script element.
     * @param lang Language of Script */
    public Script(String script, String lang)
    {
        super("script");
        attribute("language",lang);
        add(script);
    }

    /* ------------------------------------------------------------ */
    /** Construct a JavaScript script element */
    public Script(String script)
    {
        this(script, javascript);
    }
};


