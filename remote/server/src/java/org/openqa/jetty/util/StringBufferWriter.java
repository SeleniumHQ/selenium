// ========================================================================
// $Id: StringBufferWriter.java,v 1.4 2004/05/09 20:33:04 gregwilkins Exp $
// Copyright 2001-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.util;
import java.io.IOException;
import java.io.Writer;


/* ------------------------------------------------------------ */
/** A Writer to a StringBuffer.
 *
 * @version $Id: StringBufferWriter.java,v 1.4 2004/05/09 20:33:04 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class StringBufferWriter extends Writer
{
    /* ------------------------------------------------------------ */
    private StringBuffer _buffer;

    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    public StringBufferWriter()
    {
        _buffer=new StringBuffer();
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param buffer 
     */
    public StringBufferWriter(StringBuffer buffer)
    {
        _buffer=buffer;
    }

    /* ------------------------------------------------------------ */
    public void setStringBuffer(StringBuffer buffer)
    {
        _buffer=buffer;
    }
    
    /* ------------------------------------------------------------ */
    public StringBuffer getStringBuffer()
    {
        return _buffer;
    }
    
    /* ------------------------------------------------------------ */
    public void write(char c)
        throws IOException
    {
        _buffer.append(c);
    }
    
    /* ------------------------------------------------------------ */
    public void write(char[] ca)
        throws IOException
    {
        _buffer.append(ca);
    }
    
    
    /* ------------------------------------------------------------ */
    public void write(char[] ca,int offset, int length)
        throws IOException
    {
        _buffer.append(ca,offset,length);
    }
    
    /* ------------------------------------------------------------ */
    public void write(String s)
        throws IOException
    {
        _buffer.append(s);
    }
    
    /* ------------------------------------------------------------ */
    public void write(String s,int offset, int length)
        throws IOException
    {
        for (int i=0;i<length;i++)
            _buffer.append(s.charAt(offset+i));
    }
    
    /* ------------------------------------------------------------ */
    public void flush()
    {}

    /* ------------------------------------------------------------ */
    public void reset()
    {
        _buffer.setLength(0);
    }

    /* ------------------------------------------------------------ */
    public void close()
    {}

}
