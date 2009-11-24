// ========================================================================
// $Id: Break.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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
/** Break Tag.
 */
public class Break extends Tag
{
    /* ---------------------------------------------------------------- */
    /** Line Break tag type */
    public final static String Line="br";
    /** Rule Break tag type */
    public final static String Rule="hr";
    /** Paragraph Break tag type */
    public final static String Para="p";

    /* ---------------------------------------------------------------- */
    /** Default constructor (Line Break).
     */
    public Break()
    {
        this(Line);
    }
    
    /* ---------------------------------------------------------------- */
    /** Constructor.
     * @param type The Break type
     */
    public Break(String type)
    {
        super(type);
    }
    
    /* ---------------------------------------------------------------- */
    /** Static instance of line break */
    public final static Break line=new Break(Line);
    /** Static instance of rule break */
    public final static Break rule=new Break(Rule);
    /** Static instance of paragraph break */
    public final static Break para=new Break(Para);

}

