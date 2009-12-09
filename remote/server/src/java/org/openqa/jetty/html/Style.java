// ========================================================================
// $Id: Style.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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


/* -------------------------------------------------------------------- */
/** HTML Style Block.
 */
public class Style extends Block
{
    public static final String
        STYLE = "style",
        TYPE  = "type",
        MEDIA = "media";
    
    public final static String
        StyleSheet="stylesheet",
        AlternateStyleSheet="alternate stylesheet",
        text_css="text/css",
        screen = "screen";

    
    /* ------------------------------------------------------------ */
    /** Construct a Style element.
     * @param type Format of Style */
    public Style(String style, String type)
    {
        super(STYLE);
        if (type!=null)
            attribute(TYPE,type);
        add(style);
    }

    /* ------------------------------------------------------------ */
    /** Construct a Style element */
    public Style(String style)
    {
        this(style, text_css);
    }
    
    /* ------------------------------------------------------------ */
    /** Construct a Style element */
    public Style()
    {
        super(STYLE);
        attribute(TYPE,text_css);
    }
    
    /* ------------------------------------------------------------ */
    /** Set the media
     */
    public Style media(String m)
    {
        attribute(MEDIA,m);
        return this;
    }
    
    /* ------------------------------------------------------------ */
    /** Nest style content in comment 
     */
    public Style comment()
    {
        nest(new Comment());
        return this;
    }


    /* ------------------------------------------------------------ */
    /** Import another style sheet.
     * @param url The URL to import
     * @return This style
     */
    public Style importStyle(String url)
    {
        add("@import url("+url+");\n");
        return this;
    }
};




