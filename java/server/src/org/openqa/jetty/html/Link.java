// ========================================================================
// $Id: Link.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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
/** HTML Link Block.
 * This is a HTML reference (not a CSS Link).
 * @see StyleLink
 */
public class Link extends Block
{

    /* ----------------------------------------------------------------- */
    /** Construct Link.
     * @param href The target URL of the link
     */
    public Link(String href)
    {
        super("a");
        attribute("href",href);
    }

    /* ----------------------------------------------------------------- */
    /** Construct Link.
     * @param href The target URL of the link
     * @param link Link Element
     */
    public Link(String href,Object link)
    {
        this(href);
        add(link);
    }
    
    /* ----------------------------------------------------------------- */
    /** Set the link target frame.
     */
    public Link target(String t)
    {
        if (t!=null && t.length()>0)
            attribute("target",t);
        return this;
    }    
}




