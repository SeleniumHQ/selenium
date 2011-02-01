// ========================================================================
// $Id: ServletWriter.java,v 1.16 2005/08/13 00:01:27 gregwilkins Exp $
// Copyright 2000-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.jetty.servlet;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpOutputStream;
import org.openqa.jetty.util.IO;
import org.openqa.jetty.util.LogSupport;


/* ------------------------------------------------------------ */
/** Servlet PrintWriter.
 * This writer can be disabled.
 * It is crying out for optimization.
 *
 * @version $Revision: 1.16 $
 * @author Greg Wilkins (gregw)
 */
class ServletWriter extends PrintWriter
{
	private static Log log = LogFactory.getLog(ServletWriter.class);

    String encoding=null;
    OutputStream os=null;
    boolean written=false;
    
    /* ------------------------------------------------------------ */
    ServletWriter(OutputStream os)
        throws IOException
    {
        super((os instanceof HttpOutputStream) 
              ?((HttpOutputStream)os).getWriter(null)
              :new OutputStreamWriter(os));
        this.os=os;
    }
    
    /* ------------------------------------------------------------ */
    ServletWriter(OutputStream os, String encoding)
        throws IOException
    {
        super((os instanceof HttpOutputStream)
              ?((HttpOutputStream)os).getWriter(encoding)
              :new OutputStreamWriter(os,encoding));
        this.os=os;
        this.encoding=encoding;
    }

    /* ------------------------------------------------------------ */
    public void disable()
    {
        out=IO.getNullWriter();
    }
    
    /* ------------------------------------------------------------ */
    public void reset()
    {
        try{
            out=IO.getNullWriter();
            super.flush();
            out=new OutputStreamWriter(os,encoding);
            written=false;
        }
        catch(UnsupportedEncodingException e)
        {
            log.fatal(e); System.exit(1);
        }
    }
    

    /* ------------------------------------------------------------ */
    public boolean isWritten()
    {
        return written;
    }

    
    /* ------------------------------------------------------------ */
    public void print(boolean p)  {written=true;super.print(p);}
    public void print(char p)     {written=true;super.print(p);}
    public void print(char[] p)   {written=true;super.print(p);}
    public void print(double p)   {written=true;super.print(p);}
    public void print(float p)    {written=true;super.print(p);}
    public void print(int p)      {written=true;super.print(p);}
    public void print(long p)     {written=true;super.print(p);}
    public void print(Object p)   {written=true;super.print(p);}
    public void print(String p)   {written=true;super.print(p);}
    public void println()         {written=true;super.println();}
    public void println(boolean p){written=true;super.println(p);}
    public void println(char p)   {written=true;super.println(p);}
    public void println(char[] p) {written=true;super.println(p);}
    public void println(double p) {written=true;super.println(p);}
    public void println(float p)  {written=true;super.println(p);}
    public void println(int p)    {written=true;super.println(p);}
    public void println(long p)   {written=true;super.println(p);}
    public void println(Object p) {written=true;super.println(p);}
    public void println(String p) {written=true;super.println(p);}

    
    public void write(int c)
    {
        try
        {
            if (out==null)
                throw new IOException("closed");
            written=true;
            out.write(c);
        }
        catch (IOException e){LogSupport.ignore(log,e);setError();}
    }
    
    public void write(char[] cbuf, int off, int len)
    {
        try
        {
            if (out==null)
                throw new IOException("closed");
            written=true;
            out.write(cbuf,off,len);
        }
        catch (IOException e){LogSupport.ignore(log,e);setError();}
    }
    
    public void write(char[] cbuf)
    {
        try
        {
            if (out==null)
                throw new IOException("closed");
            written=true;
            out.write(cbuf,0,cbuf.length);
        }
        catch (IOException e){LogSupport.ignore(log,e);setError();}
    }

    public void write(String s, int off, int len)
    {
        try
        {
            if (out==null)
                throw new IOException("closed");
            written=true;
            out.write(s,off,len);
        }
        catch (IOException e){LogSupport.ignore(log,e);setError();}
    }

    public void write(String s)
    {
        try
        {
            if (out==null)
                throw new IOException("closed");
            written=true;
            out.write(s,0,s.length());
        }
        catch (IOException e){LogSupport.ignore(log,e);setError();}
    }
}
