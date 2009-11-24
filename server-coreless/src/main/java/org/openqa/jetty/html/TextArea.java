// ========================================================================
// $Id: TextArea.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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
/** A Text Area within a form.
 * <p> The text in the textarea is handled by the super class, Text
 * @see org.openqa.jetty.html.Text
 */
public class TextArea extends Block
{
    /* ----------------------------------------------------------------- */
    /** @param name The name of the TextArea within the form */
    public TextArea(String name)
    {
        super("textarea");
        attribute("name",name);
    }

    /* ----------------------------------------------------------------- */
    /** @param name The name of the TextArea within the form
     * @param s The string in the text area */
    public TextArea(String name, String s)
    {
        this(name);
        add(s);
    }

    /* ----------------------------------------------------------------- */
    public TextArea setSize(int cols,int lines)
    {
        attribute("rows",lines);
        attribute("cols",cols);
        return this;
    }
}

