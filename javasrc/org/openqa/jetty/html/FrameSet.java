// ========================================================================
// $Id: FrameSet.java,v 1.4 2004/11/20 13:32:33 gregwilkins Exp $
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
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Vector;

/* ---------------------------------------------------------------- */
/** FrameSet.
 * <p>
 * Usage
 * <pre>
 *      FrameSet set = new FrameSet("FrameTest","*,*","*,*");
 *      set.frame(0,0).name("Frame1",req.getRequestPath()+"?Frame=1");
 *      set.frame(0,1).name("Frame2",req.getRequestPath()+"?Frame=2");
 *      set.frame(1,0).name("Frame3",req.getRequestPath()+"?Frame=3");
 *      set.frame(1,1).name("Frame4",req.getRequestPath()+"?Frame=4");
 *      set.write(new Writer(res.getOutputStream()));
 * </pre>
 * @version $Id: FrameSet.java,v 1.4 2004/11/20 13:32:33 gregwilkins Exp $
 * @author Greg Wilkins
*/
public class FrameSet extends Page
{
    Frame[][] frames=null;
    String colSpec=null;
    String rowSpec=null;
    int cols;
    int rows;
    String border="";
    Vector frameNames=null;
    Hashtable frameMap=null;
    
    /* ------------------------------------------------------------ */
    /** FrameSet constructor.
     * @param colSpec Comma separated list of column widths specified
     *                as pixels, percentage or '*' for variable
     */
    public FrameSet(String title, String colSpec, String rowSpec)
    {
        super(title);

        this.colSpec=colSpec;
        this.rowSpec=rowSpec;
        
        cols=1;
        rows=1;

        int i=-1;
        while(colSpec != null && (i=colSpec.indexOf(",",i+1))>=0)
            cols++;
        
        i=-1;
        while(rowSpec != null && (i=rowSpec.indexOf(",",i+1))>=0)
            rows++;
        
        frames=new Frame[cols][rows];
        for(int c=0;c<cols;c++)
            for(int r=0;r<rows;r++)
                frames[c][r]=new Frame();
    }
    
    /* ------------------------------------------------------------ */
    public Frame frame(int col, int row)
    {
        return frames[col][row];
    }

    /* ------------------------------------------------------------ */
    public FrameSet border(boolean threeD, int width, String color)
    {
        border=" frameborder=\""+(threeD?"yes":"no")+"\"";
        if (width>=0)
            border+=" border=\""+width+"\"";

        if (color!=null)
            border+=" bordercolor=\""+color+"\"";
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    public Enumeration namedFrames()
    {
        if (frameNames==null)
            return new Vector().elements();
        return frameNames.elements();
    }
    
    /* ----------------------------------------------------------------- */
    public Frame frame(String name)
    {
        if (frameMap==null)
            return null;
        return (Frame) frameMap.get(name);
    }
    
    /* ----------------------------------------------------------------- */
    /** Name a frame.
     * By convention, frame names match Page section names
     */
    public Frame nameFrame(String name,int col, int row)
    {
        if (frameMap==null)
        {
            frameMap=new Hashtable(10);
            frameNames=new Vector(10);
        }
        
        Frame frame = frames[col][row];
        if (frame==null)
            frame = frames[col][row] = new Frame();
        
        if (frameMap.get(name)==null)
            frameNames.addElement(name);
        frameMap.put(name,frame);
        frame.name(name);

        return frame;
    }
    
    
    /* ----------------------------------------------------------------- */
    public void write(Writer out)
         throws IOException
    {
        writeHtmlHead(out);
        
        out.write("<frameset "+border);
        
        if(colSpec!=null)
            out.write(" cols=\""+colSpec+"\"");
        if(rowSpec!=null)
            out.write(" rows=\""+rowSpec+"\"");
        out.write(">");

        for(int r=0;r<rows;r++)
            for(int c=0;c<cols;c++)
                frames[c][r].write(out);

        out.write("<noframes>");
        writeElements(out);
        out.write("</noframes>");

        out.write("</frameset>");
        out.write("</html>");
    }
};


