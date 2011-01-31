// ========================================================================
// $Id: Frame.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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

/** FrameSet.
 * @version $Id: Frame.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
 * @author Greg Wilkins
*/
public class Frame
{
    String src=null;
    String name=null;
    
    String scrolling="auto";
    String resize="";
    String border="";
    
    /* ------------------------------------------------------------ */
    /** Frame constructor.
     */
    Frame(){}
    
    /* ------------------------------------------------------------ */
    public Frame border(boolean threeD, int width, String color)
    {
        border=" frameborder=\""+(threeD?"yes":"no")+"\"";
        if (width>=0)
            border+=" border=\""+width+"\"";

        if (color!=null)
            border+=" BORDERCOLOR=\""+color+"\"";
        return this;
    }
    /* ------------------------------------------------------------ */
    public Frame name(String name,String src)
    {
        this.name=name;
        this.src=src;
        return this;
    }
    
    /* ------------------------------------------------------------ */
    public Frame src(String s)
    {
        src=s;
        return this;
    }
    
    /* ------------------------------------------------------------ */
    public Frame name(String n)
    {
        name=n;
        return this;
    }

    /* ------------------------------------------------------------ */
    public Frame scrolling(boolean s)
    {
        scrolling=s?"yes":"no";
        return this;
    }
    
    /* ------------------------------------------------------------ */
    public Frame resize(boolean r)
    {
        resize=r?"":" noresize";
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    void write(Writer out)
         throws IOException
    {
        out.write("<frame scrolling=\""+scrolling+"\""+resize+border);
        
        if(src!=null)
            out.write(" src=\""+src+"\"");
        if(name!=null)
            out.write(" name=\""+name+"\"");
        out.write(">");
    }
};






