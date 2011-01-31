// ========================================================================
// $Id: Font.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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
/** HTML Font Block.
 * Each Element added to the List (which is a Composite) is treated
 * as a new List Item.
 * @see  org.openqa.jetty.html.Block
 */
public class Font extends Block
{    
    /* ----------------------------------------------------------------- */
    public Font()
    {
        super("font");
    }
    
    /* ----------------------------------------------------------------- */
    public Font(int size)
    {
        this();
        size(size);
    }
    
    /* ----------------------------------------------------------------- */
    public Font(int size, boolean relativeSize)
    {
        this();
        size(((relativeSize && size>=0)?"+":"")+size);
    }
    
    /* ----------------------------------------------------------------- */
    public Font(int size,String attributes)
    {
        this();
        size(size);
        this.attribute(attributes);
    }
    
    /* ----------------------------------------------------------------- */
    public Font(String attributes)
    {
        super("font",attributes);
    }
    
    /* ----------------------------------------------------------------- */
    public Font face(String face)
    {
        attribute("face",face);
        return this;
    }
    
}



