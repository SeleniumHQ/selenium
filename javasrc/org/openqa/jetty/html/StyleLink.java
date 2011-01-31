// ========================================================================
// $Id: StyleLink.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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

package org.openqa.jetty.html;


/* ------------------------------------------------------------ */
/** CSS Style LINK.
 *
 * @version $Id: StyleLink.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class StyleLink extends Tag
{
    public final static String
        REL="rel",
        HREF="href",
        TYPE=Style.TYPE,
        MEDIA=Style.MEDIA;
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param href The URL of the style sheet
     */
    public StyleLink(String href)
    {
        super("link");
        attribute(REL,Style.StyleSheet);
        attribute(HREF,href);
        attribute(TYPE,Style.text_css);
    }
    
    /* ------------------------------------------------------------ */
    /** Full Constructor. 
     * @param rel Style Relationship, default StyleSheet if null.
     * @param href The URL of the style sheet
     * @param type The type, default text/css if null
     * @param media The media, not specified if null
     */
    public StyleLink(String rel, String href, String type, String media)
    {
        super("link");
        attribute(REL,rel==null?Style.StyleSheet:rel);
        attribute(HREF,href);
        attribute(TYPE,type==null?Style.text_css:type);
        if (media!=null)
            attribute(MEDIA,media);
    }
    
};








