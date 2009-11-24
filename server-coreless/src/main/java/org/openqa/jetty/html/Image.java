// ========================================================================
// $Id: Image.java,v 1.8 2005/08/13 00:01:23 gregwilkins Exp $
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
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.IO;
import org.openqa.jetty.util.LogSupport;

/* ---------------------------------------------------------------- */
/** HTML Image Tag.
 * @see org.openqa.jetty.html.Block
 * @version $Id: Image.java,v 1.8 2005/08/13 00:01:23 gregwilkins Exp $
 * @author Greg Wilkins
*/
public class Image extends Tag
{
    private static Log log = LogFactory.getLog(Image.class);

    /* ------------------------------------------------------------ */
    public Image(String src)
    {
        super("img");
        attribute("src",src);
    }
    
    /* ------------------------------------------------------------ */
    /** Construct from GIF file.
     */
    public Image(String dirname, String src)
    {
        super("img");
        attribute("src",src);
        setSizeFromGif(dirname,src);
    }
    
    /* ------------------------------------------------------------ */
    /** Construct from GIF file.
     */
    public Image(File gif)
    {
        super("img");
        attribute("src",gif.getName());
        setSizeFromGif(gif);
    }

    /* ------------------------------------------------------------ */
    public Image(String src,int width, int height, int border)
    {
        this(src);
        width(width);
        height(height);
        border(border);
    }
    
    /* ------------------------------------------------------------ */
    public Image border(int b)
    {
        attribute("border",b);
        return this;
    }
    
    /* ------------------------------------------------------------ */
    public Image alt(String alt)
    {
        attribute("alt",alt);
        return this;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the image size from the header of a GIF file.
     * @param dirname The directory name, expected to be in OS format
     * @param pathname The image path name relative to the directory.
     *                 Expected to be in WWW format (i.e. with slashes)
     *                 and will be converted to OS format.
     */
    public Image setSizeFromGif(String dirname,
                                String pathname)
    {
        String filename =dirname + pathname.replace('/',File.separatorChar);
        return setSizeFromGif(filename);
    }
    
    /* ------------------------------------------------------------ */
    /** Set the image size from the header of a GIF file.
     */
    public Image setSizeFromGif(String filename)
    {
        return setSizeFromGif(new File(filename));
    }
    
    /* ------------------------------------------------------------ */
    /** Set the image size from the header of a GIF file.
     */
    public Image setSizeFromGif(File gif)
    {
        if (gif.canRead())
        {
            FileInputStream in = null;
            try{
                byte [] buf = new byte[10];
                in = new FileInputStream(gif);
                if (in.read(buf,0,10)==10)
                {
                    if(log.isDebugEnabled())log.debug("Image "+gif.getName()+
                               " is " +
                               ((0x00ff&buf[7])*256+(0x00ff&buf[6])) +
                               " x " +
                               (((0x00ff&buf[9])*256+(0x00ff&buf[8]))));
                    width((0x00ff&buf[7])*256+(0x00ff&buf[6]));
                    height(((0x00ff&buf[9])*256+(0x00ff&buf[8])));
                }
            }
            catch (IOException e){
                LogSupport.ignore(log,e);
            }
            finally {
                IO.close(in);
            }
        }
        
        return this;
    }
    
}



