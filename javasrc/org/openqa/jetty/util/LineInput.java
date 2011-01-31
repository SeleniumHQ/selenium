// ========================================================================
// $Id: LineInput.java,v 1.17 2005/10/05 11:32:40 gregwilkins Exp $
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

package org.openqa.jetty.util;

import java.io.ByteArrayInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;


/* ------------------------------------------------------------ */
/** Fast LineInput InputStream.
 * This buffered InputStream provides methods for reading lines
 * of bytes. The lines can be converted to String or character
 * arrays either using the default encoding or a user supplied
 * encoding.
 *
 * Buffering and data copying are highly optimized, making this
 * an ideal class for protocols that mix character encoding lines
 * with arbitrary byte data (eg HTTP).
 *
 * The buffer size is also the maximum line length in bytes and/or
 * characters. If the byte length of a line is less than the max,
 * but the character length is greater, than then trailing characters
 * are lost.
 *
 * Line termination is forgiving and accepts CR, LF, CRLF or EOF.
 * Line input uses the mark/reset mechanism, so any marks set
 * prior to a readLine call are lost.
 *
 * @version $Id: LineInput.java,v 1.17 2005/10/05 11:32:40 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class LineInput extends FilterInputStream                           
{
    private static Log log = LogFactory.getLog(LineInput.class);

    /* ------------------------------------------------------------ */
    private byte _buf[];
    private ByteBuffer _byteBuffer;
    private InputStreamReader _reader;
    private int _mark=-1;  // reset marker
    private int _pos;      // Start marker
    private int _avail;    // Available back marker, may be byte limited
    private int _contents; // Absolute back marker of buffer
    private int _byteLimit=-1;
    private boolean _newByteLimit;
    private LineBuffer _lineBuffer;
    private String _encoding;
    private boolean _eof=false;
    private boolean _lastCr=false;
    private boolean _seenCrLf=false;
    
    private final static int LF=10;
    private final static int CR=13;

    
    /* ------------------------------------------------------------ */
    /** Constructor.
     * Default buffer and maximum line size is 2048.
     * @param in The underlying input stream.
     */
    public LineInput(InputStream in)
    {
        this(in,0);
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param in The underlying input stream.
     * @param bufferSize The buffer size and maximum line length.
     */
    public LineInput(InputStream in, int bufferSize)
    {
        super(in);
        _mark=-1;
        if (bufferSize==0)
            bufferSize=8192;
        _buf=ByteArrayPool.getByteArray(bufferSize);
        _byteBuffer=new ByteBuffer(_buf);
        _lineBuffer=new LineBuffer(bufferSize);
        
        try
        {
            _reader=new InputStreamReader(_byteBuffer,"UTF-8");
        }
        catch (UnsupportedEncodingException e)
        {
            _reader=new InputStreamReader(_byteBuffer);
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param in The underlying input stream.
     * @param bufferSize The buffer size and maximum line length.
     * @param encoding the character encoding to use for readLine methods.
     * @exception UnsupportedEncodingException 
     */
    public LineInput(InputStream in, int bufferSize, String encoding)
        throws UnsupportedEncodingException
    {
        super(in);
        _mark=-1;
        if (bufferSize==0)
            bufferSize=2048;
        _buf=ByteArrayPool.getByteArray(bufferSize);
        _byteBuffer=new ByteBuffer(_buf);
        _lineBuffer=new LineBuffer(bufferSize);
        _reader=new InputStreamReader(_byteBuffer,encoding);
        _encoding=encoding;
    }
    
    /* ------------------------------------------------------------ */
    public InputStream getInputStream()
    {
        return in;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the byte limit.
     * If set, only this number of bytes are read before EOF.
     * @param bytes Limit number of bytes, or -1 for no limit.
     */
    public void setByteLimit(int bytes)
    {
        _byteLimit=bytes;
        
        if (bytes>=0)
        {
            _newByteLimit=true;
            _byteLimit-=_contents-_pos;
            if (_byteLimit<0)
            {
                _avail+=_byteLimit;
                _byteLimit=0;
            }
        }
        else
        {
            _newByteLimit=false;
            _avail=_contents;
            _eof=false;
        }
    }
    
    
    /* ------------------------------------------------------------ */
    /** Get the byte limit.
     * @return Number of bytes until EOF is returned or -1 for no limit.
     */
    public int getByteLimit()
    {
        if (_byteLimit<0)
            return _byteLimit;
        
        return _byteLimit+_avail-_pos;
    }
    
    /* ------------------------------------------------------------ */
    /** Read a line ended by CR, LF or CRLF.
     * The default or supplied encoding is used to convert bytes to
     * characters.
     * @return The line as a String or null for EOF.
     * @exception IOException 
     */
    public synchronized String readLine()
        throws IOException
    {
        int len=fillLine(_buf.length);
        
        if (len<0)
            return null;

        String s=null;
        if (_encoding==null)
            s=new String(_buf,_mark,len);
        else
        {
            try
            {
                s=new String(_buf,_mark,len,_encoding);
            }
            catch(UnsupportedEncodingException e)
            {
                log.warn(LogSupport.EXCEPTION,e);
            }
        }
        _mark=-1;

        return s;
    }
    
    /* ------------------------------------------------------------ */
    /** Read a line ended by CR, LF or CRLF.
     * The default or supplied encoding is used to convert bytes to
     * characters.
     * @param c Character buffer to place the line into.
     * @param off Offset into the buffer.
     * @param len Maximum length of line.
     * @return The length of the line or -1 for EOF.
     * @exception IOException 
     */
    public int readLine(char[] c,int off,int len)
        throws IOException
    {
        int blen=fillLine(len);

        if (blen<0)
            return -1;
        if (blen==0)
            return 0;
        
        _byteBuffer.setStream(_mark,blen);
        
        int read=0;
        while(read<len && _reader.ready())
        {
            int r = _reader.read(c,off+read,len-read);
            if (r<=0)
                break;
            read+=r;
        }
        
        _mark=-1;

        return read;
    }
    
    /* ------------------------------------------------------------ */
    /** Read a line ended by CR, LF or CRLF.
     * @param b Byte array to place the line into.
     * @param off Offset into the buffer.
     * @param len Maximum length of line.
     * @return The length of the line or -1 for EOF.
     * @exception IOException 
     */
    public int readLine(byte[] b,int off,int len)
        throws IOException
    {
        len=fillLine(len);

        if (len<0)
            return -1;
        if (len==0)
            return 0;
        
        System.arraycopy(_buf,_mark, b, off, len);
        _mark=-1;

        return len;
    }

    
    /* ------------------------------------------------------------ */
    /** Read a Line ended by CR, LF or CRLF.
     * Read a line into a shared LineBuffer instance.  The LineBuffer is
     * resused between calls and should not be held by the caller.
     * The default or supplied encoding is used to convert bytes to
     * characters.
     * @return LineBuffer instance or null for EOF.
     * @exception IOException 
     */
    public LineBuffer readLineBuffer()
        throws IOException
    {
        return readLineBuffer(_buf.length);
    }
    
    /* ------------------------------------------------------------ */
    /** Read a Line ended by CR, LF or CRLF.
     * Read a line into a shared LineBuffer instance.  The LineBuffer is
     * resused between calls and should not be held by the caller.
     * The default or supplied encoding is used to convert bytes to
     * characters.
     * @param len Maximum length of a line, or 0 for default
     * @return LineBuffer instance or null for EOF.
     * @exception IOException 
     */
    public LineBuffer readLineBuffer(int len)
        throws IOException
    {
        len=fillLine(len>0?len:_buf.length);

        if (len<0)
            return null;
        
        if (len==0)
        {
            _lineBuffer.size=0;
            return _lineBuffer;
        }

        _byteBuffer.setStream(_mark,len);
        
        _lineBuffer.size=0;
        int read=0;
        while(read<len && _reader.ready())
        {
            int r = _reader.read(_lineBuffer.buffer,
                                 read,
                                 len-read);
            if (r<=0)
                break;
            read+=r;
        }
        _lineBuffer.size=read;
        _mark=-1;

        return _lineBuffer;
    }
    
    /* ------------------------------------------------------------ */
    public synchronized int read() throws IOException
    {
        int b;
        if (_pos >=_avail)
            fill();
        if (_pos >=_avail)
            b=-1;
        else
            b=_buf[_pos++]&255;
        
        return b;
    }
 
 
    /* ------------------------------------------------------------ */
    public synchronized int read(byte b[], int off, int len) throws IOException
    {
        int avail=_avail-_pos;
        if (avail <=0)
        {
            fill();
            avail=_avail-_pos;
        }

        if (avail <=0)
            len=-1;
        else
        {
            len=(avail < len) ? avail : len;
            System.arraycopy(_buf,_pos,b,off,len);
            _pos +=len;
        }
        
        return len;
    }
    
    /* ------------------------------------------------------------ */
    public long skip(long n) throws IOException
    {
        int avail=_avail-_pos;
        if (avail <=0)
        {
            fill();
            avail=_avail-_pos;
        }

        if (avail <=0)
            n=0;
        else
        {
            n=(avail < n) ? avail : n;
            _pos +=n;
        }
        
        return n;
    }


    /* ------------------------------------------------------------ */
    public synchronized int available()
        throws IOException
    {
        int in_stream=in.available();
        if (_byteLimit>=0 && in_stream>_byteLimit)
            in_stream=_byteLimit;
        
        return _avail - _pos + in_stream;
    }

    /* ------------------------------------------------------------ */
    public synchronized void mark(int limit)
        throws IllegalArgumentException
    {
        if (limit>_buf.length)
        {
            byte[] new_buf=new byte[limit];
            System.arraycopy(_buf,_pos,new_buf,_pos,_avail-_pos);
            _buf=new_buf;
            if (_byteBuffer!=null)
                _byteBuffer.setBuffer(_buf);
        }
        _mark=_pos;
    }

    /* ------------------------------------------------------------ */
    public synchronized void reset()
        throws IOException
    {
        if (_mark < 0)
            throw new IOException("Resetting to invalid mark");
        _pos=_mark;
        _mark=-1;
    }

    /* ------------------------------------------------------------ */
    public boolean markSupported()
    {
        return true;
    }
    
    /* ------------------------------------------------------------ */
    private void fill()
        throws IOException
    {
        // if the mark is in the middle of the buffer
        if (_mark > 0)
        {
            // moved saved bytes to start of buffer
            int saved=_contents - _mark;
            System.arraycopy(_buf, _mark, _buf, 0, saved);
            _pos-=_mark;
            _avail-=_mark;
            _contents=saved;
            _mark=0;
        }
        else if (_mark<0 && _pos>0)
        {
            // move remaining bytes to start of buffer
            int saved=_contents-_pos;
            System.arraycopy(_buf,_pos, _buf, 0, saved);
            _avail-=_pos;
            _contents=saved;
            _pos=0;
        }
        else if (_mark==0 && _pos>0 && _contents==_buf.length)
        {
            // Discard the mark as we need the space.
            _mark=-1;
            fill();
            return;
        }

        // Get ready to top up the buffer
        int n=0;
        _eof=false;

        // Handle byte limited EOF
        if (_byteLimit==0)
            _eof=true;
        // else loop until something is read.
        else while (!_eof && n==0 && _buf.length>_contents)
        {
            // try to read as much as will fit.
            int space=_buf.length-_contents;

            n=in.read(_buf,_contents,space);

            if (n<=0)
            {
                // If no bytes - we could be NBIO, so we want to avoid
                // a busy loop.
                if (n==0)
                {
                    // Yield to give a chance for some bytes to turn up
                    Thread.yield();

                    // Do a byte read as that is blocking
                    int b = in.read();
                    if (b>=0)
                    {
                        n=1;
                        _buf[_contents++]=(byte)b;
                    }
                    else
                        _eof=true;
                }
                else
                    _eof=true;
            }
            else
                _contents+=n;
            _avail=_contents;

            // If we have a byte limit
            if (_byteLimit>0)
            {
                // adjust the bytes available
                if (_contents-_pos >=_byteLimit)
                    _avail=_byteLimit+_pos;
                
                if (n>_byteLimit)
                    _byteLimit=0;
                else if (n>=0)
                    _byteLimit-=n;
                else if (n==-1)
                    throw new IOException("Premature EOF");
            }
        }
        
        // If we have some characters and the last read was a CR and
        // the first char is a LF, skip it
        if (_avail-_pos>0 && _lastCr && _buf[_pos]==LF)
        {
            _seenCrLf=true;
            _pos++;
            if (_mark>=0)
                _mark++;
            _lastCr=false;

            // If the byte limit has just been imposed, dont count
            // LF as content.
            if(_byteLimit>=0 && _newByteLimit)
            {
                if (_avail<_contents)
                    _avail++;
                else
                    _byteLimit++;
            }
            // If we ate all that ws filled, fill some more
            if (_pos==_avail)
                fill();
        }
        _newByteLimit=false;
    }

    
    /* ------------------------------------------------------------ */
    private int fillLine(int maxLen)
        throws IOException
    {
        _mark=_pos;
        
        if (_pos>=_avail)
            fill();
        if (_pos>=_avail)
            return -1;
        
        byte b;  
        boolean cr=_lastCr;
        boolean lf=false;
        _lastCr=false;
        int len=0;
        
    LineLoop:
        while (_pos<=_avail)
        {
            // if we have gone past the end of the buffer
            while (_pos==_avail)
            {
                // If EOF or no more space in the buffer,
                // return a line.
                if (_eof || (_mark==0 && _contents==_buf.length))
                {
                    _lastCr=!_eof && _buf[_avail-1]==CR;
                    
                    cr=true;
                    lf=true;
                    break LineLoop;
                }
                
                // If we have a CR and no more characters are available
                if (cr && in.available()==0 && !_seenCrLf)
                {
                    _lastCr=true;
                    cr=true;
                    lf=true;
                    break LineLoop;
                }
                else
                {
                    // Else just wait for more...
                    _pos=_mark;
                    fill();
                    _pos=len;
                    cr=false;
                }
            }

            // Get the byte
            b=_buf[_pos++];
            
            switch(b)
            {
              case LF:
                  if (cr) _seenCrLf=true;
                  lf=true;
                  break LineLoop;
                
              case CR: 
                  if (cr)
                  {
                      // Double CR
                      if (_pos>1)
                      {
                          _pos--;
                          break LineLoop;
                      }
                  }
                  cr=true;
                  break;
                
              default:
                  if(cr)
                  {
                      if (_pos==1)
                          cr=false;
                      else
                      {
                          _pos--;
                          break LineLoop;
                      }
                  }
                  
                  len++;
                  if (len==maxLen)
                  {
                      // look for EOL
                      if (_mark!=0 && _pos+2>=_avail && _avail<_buf.length)
                          fill();
                          
                      if (_pos<_avail && _buf[_pos]==CR)
                      {
                          cr=true;
                          _pos++;
                      }
                      if (_pos<_avail && _buf[_pos]==LF)
                      {
                          lf=true;
                          _pos++;
                      }
                      
                      if (!cr && !lf)
                      {
                          // fake EOL
                          lf=true;
                          cr=true;
                      }
                      break LineLoop;
                  }
                  
                  break;
            }
        }
        
        if (!cr && !lf && len==0)
            len=-1;
        
        return len;
    }

    /* ------------------------------------------------------------ */
    private static class ByteBuffer extends ByteArrayInputStream
    {
        ByteBuffer(byte[] buffer)
        {
            super(buffer);
        }
        
        void setBuffer(byte[] buffer)
        {
            buf=buffer;
        }
        
        void setStream(int offset,int length)
        {
            pos=offset;
            count=offset+length;
            mark=-1;
        }        
    }
    
    /* ------------------------------------------------------------ */
    /** Reusable LineBuffer.
     * Externalized LineBuffer for fast line parsing.
     */
    public static class LineBuffer
    {
        public char[] buffer;
        public int size;
        public LineBuffer(int maxLineLength)
        {buffer=new char[maxLineLength];}

        public String toString(){return new String(buffer,0,size);}
    }

    /* ------------------------------------------------------------ */
    public void destroy()
    {
        ByteArrayPool.returnByteArray(_buf);
        _byteBuffer=null;
        _reader=null;
        _lineBuffer=null;
        _encoding=null;
    }

    
}

