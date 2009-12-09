// ========================================================================
// $Id: Block.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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

/* -------------------------------------------------------------------- */
/** HTML Block Composite.
 * Block of predefined or arbitrary type.
 * Block types are predefined for PRE, BLOCKQUOTE, CENTER, LISTING,
 * PLAINTEXT, XMP, DIV (Left and Right) and SPAN.
 * @see  org.openqa.jetty.html.Composite
 */
public class Block extends Composite
{
    /* ----------------------------------------------------------------- */
    /** Preformatted text */
    public static final String Pre="pre";
    /** Quoted Text */
    public static final String Quote="blockquote";
    /** Center the block */
    public static final String Center="center";
    /** Code listing style */
    public static final String Listing="listing";
    /** Plain text */
    public static final String Plain="plaintext";
    /** Old pre format - preserve line breaks */
    public static final String Xmp="xmp";
    /** Basic Division */
    public static final String Div="div";
    /** Left align */
    public static final String Left="divl";
    /** Right align */
    public static final String Right="divr";
    /** Bold */
    public static final String Bold="b";
    /** Italic */
    public static final String Italic="i";
    /** Span */
    public static final String Span="span";

    /* ----------------------------------------------------------------- */
    private String tag;

    /* ----------------------------------------------------------------- */
    /** Construct a block using the passed string as the tag.
     * @param tag The tag to use to open and close the block.
     */
    public Block(String tag)
    {
        this.tag=tag;
        if (tag==Left)
        {
            tag=Div;
            left();
        }
        if (tag==Right)
        {
            tag=Div;
            right();
        }
    }

    /* ----------------------------------------------------------------- */
    /** Construct a block using the passed string as the tag.
     * @param tag The tag to use to open and close the block.
     * @param attributes String of attributes for opening tag.
     */
    public Block(String tag, String attributes)
    {
        super(attributes);
        this.tag=tag;
    }
        
    /* ----------------------------------------------------------------- */
    public void write(Writer out)
         throws IOException
    {
        out.write('<'+tag+attributes()+'>');
        super.write(out);
        out.write("</"+tag+"\n>");
    }
}


