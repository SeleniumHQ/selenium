// ========================================================================
// $Id: AbstractHttpHandler.java,v 1.12 2005/08/13 00:01:26 gregwilkins Exp $
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

package org.openqa.jetty.http.handler;

import java.io.IOException;
import java.io.OutputStream;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpHandler;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.util.ByteArrayISO8859Writer;

/* ------------------------------------------------------------ */
/** Base HTTP RestishHandler.
 * This No-op handler is a good base for other handlers
 *
 * @version $Id: AbstractHttpHandler.java,v 1.12 2005/08/13 00:01:26 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
abstract public class AbstractHttpHandler implements HttpHandler
{
    private static Log log = LogFactory.getLog(AbstractHttpHandler.class);

    /* ----------------------------------------------------------------- */
    private String _name;
    
    private transient HttpContext _context;
    private transient boolean _started=false;

    
    /* ------------------------------------------------------------ */
    public void setName(String name)
    {
        _name=name;
    }
    
    /* ------------------------------------------------------------ */
    public String getName()
    {
        if (_name==null)
        {
            _name=this.getClass().getName();
            if (!log.isDebugEnabled())
                _name=_name.substring(_name.lastIndexOf('.')+1);
        }
        return _name;
    }
    
    /* ------------------------------------------------------------ */
    public HttpContext getHttpContext()
    {
        return _context;
    }
    
    /* ------------------------------------------------------------ */
    /** Initialize with a HttpContext.
     * Called by addHandler methods of HttpContext.
     * @param context Must be the HttpContext of the handler
     */
    public void initialize(HttpContext context)
    {
        if (_context==null)
            _context=context;
        else if (_context!=context)
            throw new IllegalStateException("Can't initialize handler for different context");
    }
    
    /* ----------------------------------------------------------------- */
    public void start()
        throws Exception
    {
        if (_context==null)
            throw new IllegalStateException("No context for "+this);        
        _started=true;
        if(log.isDebugEnabled())log.debug("Started "+this);
    }
    
    /* ----------------------------------------------------------------- */
    public void stop()
        throws InterruptedException
    {
        _started=false;
        if(log.isDebugEnabled())log.debug("Stopped "+this);
    }

    /* ----------------------------------------------------------------- */
    public boolean isStarted()
    {
        return _started;
    }
    
    /* ------------------------------------------------------------ */
    public String toString()
    {
        return getName()+" in "+_context;
    }    

    /* ----------------------------------------------------------------- */
    public void handleTrace(HttpRequest request,
                            HttpResponse response)
        throws IOException
    {
        boolean trace=getHttpContext().getHttpServer().getTrace();
        
        // Handle TRACE by returning request header
        response.setField(HttpFields.__ContentType,
                          HttpFields.__MessageHttp);
        if (trace)
        {
            OutputStream out = response.getOutputStream();
            ByteArrayISO8859Writer writer = new ByteArrayISO8859Writer();
            writer.write(request.toString());
            writer.flush();
            response.setIntField(HttpFields.__ContentLength,writer.size());
            writer.writeTo(out);
            out.flush();
        }
        request.setHandled(true);
    }
}




