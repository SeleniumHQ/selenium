// ========================================================================
// $Id: HttpResponse.java,v 1.61 2005/10/26 08:10:14 gregwilkins Exp $
// Copyright 199-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.http;

import java.io.IOException;
import java.io.Writer;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.HashMap;

import javax.servlet.http.Cookie;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.StringUtil;
import org.openqa.jetty.util.TypeUtil;
import org.openqa.jetty.util.UrlEncoded;


/* ------------------------------------------------------------ */
/** HTTP Response.
 * This class manages the headers, trailers and content streams
 * of a HTTP response. It can be used for receiving or generating
 * requests.
 *
 * This class is not synchronized. It should be explicitly
 * synchronized if it is used by multiple threads.
 *
 * @see HttpRequest
 * @version $Id: HttpResponse.java,v 1.61 2005/10/26 08:10:14 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class HttpResponse extends HttpMessage
{
    private static Log log = LogFactory.getLog(HttpResponse.class);
 
      public final static int
          __100_Continue = 100,
          __101_Switching_Protocols = 101,
          __102_Processing = 102,
          __200_OK = 200,
          __201_Created = 201,
          __202_Accepted = 202,
          __203_Non_Authoritative_Information = 203,
          __204_No_Content = 204,
          __205_Reset_Content = 205,
          __206_Partial_Content = 206,
          __207_Multi_Status = 207,
          __300_Multiple_Choices = 300,
          __301_Moved_Permanently = 301,
          __302_Moved_Temporarily = 302,
          __302_Found = 302,
          __303_See_Other = 303,
          __304_Not_Modified = 304,
          __305_Use_Proxy = 305,
          __400_Bad_Request = 400,
          __401_Unauthorized = 401, 
          __402_Payment_Required = 402,
          __403_Forbidden = 403,
          __404_Not_Found = 404,
          __405_Method_Not_Allowed = 405,
          __406_Not_Acceptable = 406,
          __407_Proxy_Authentication_Required = 407,
          __408_Request_Timeout = 408,
          __409_Conflict = 409,
          __410_Gone = 410,
          __411_Length_Required = 411,
          __412_Precondition_Failed = 412,
          __413_Request_Entity_Too_Large = 413,
          __414_Request_URI_Too_Large = 414,
          __415_Unsupported_Media_Type = 415,
          __416_Requested_Range_Not_Satisfiable = 416,
          __417_Expectation_Failed = 417,
          __422_Unprocessable_Entity = 422,
          __423_Locked = 423,
          __424_Failed_Dependency = 424,
          __500_Internal_Server_Error = 500,
          __501_Not_Implemented = 501,
          __502_Bad_Gateway = 502,
          __503_Service_Unavailable = 503,
          __504_Gateway_Timeout = 504,
          __505_HTTP_Version_Not_Supported = 505,
          __507_Insufficient_Storage = 507;

          
    /* -------------------------------------------------------------- */
    public final static HashMap __statusMsg = new HashMap();
    static
    {
        // Build error code map using reflection
        try
        {
            Field[] fields = org.openqa.jetty.http.HttpResponse.class
                .getDeclaredFields();
            for (int f=fields.length; f-->0 ;)
            {
                int m = fields[f].getModifiers();
                String name=fields[f].getName();
                if (Modifier.isFinal(m) &&
                    Modifier.isStatic(m) &&
                    fields[f].getType().equals(Integer.TYPE) &&
                    name.startsWith("__") &&
                    Character.isDigit(name.charAt(2)))
                {
                    String message = name.substring(6);
                    message = message.replace('_',' ');
                    __statusMsg.put(fields[f].get(null),message);
                }
            }
        }
        catch (Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
        }
    }
    
    /* ------------------------------------------------------------ */
    static byte[] __Continue;
    static
    {
        try{
            __Continue="HTTP/1.1 100 Continue\015\012\015\012".getBytes(StringUtil.__ISO_8859_1);
        }
        catch (Exception e){log.fatal(e); System.exit(1);}
    }
    
    /* -------------------------------------------------------------- */
    private int _status= __200_OK;
    private String _reason;
    private HttpContext _httpContext;
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    public HttpResponse()
    {
        _version=__HTTP_1_1;
        _dotVersion=1;
        _state=__MSG_EDITABLE;
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param connection 
     */
    public HttpResponse(HttpConnection connection)
    {
        super(connection);
        _version=__HTTP_1_1;
        _dotVersion=1;
        _state=__MSG_EDITABLE;
    }

    /* ------------------------------------------------------------ */
    /** Get the HttpContext handling this reponse. 
     * @return The HttpContext that is handling this request.
     */
    public HttpContext getHttpContext()
    {
        return _httpContext;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the HttpContext handling this reponse.
     * @param context The HttpContext handling this reponse.
     */
    public void setHttpContext(HttpContext context)
    {
        _httpContext=context;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @return true if the message has been modified. 
     */
    public boolean isDirty()
    {
        return _status!=__200_OK || super.isDirty();
    }

    /* ------------------------------------------------------------ */
    /** Reset the response.
     * Clears any data that exists in the buffer as well as the status
     * code. If the response has been committed, this method throws an 
     * <code>IllegalStateException</code>.
     *
     * @exception IllegalStateException  if the response has already been
     *                                   committed
     */
    public void reset()
    {
        if (isCommitted())
            throw new IllegalStateException("Already committed");

        try
        {
            ((HttpOutputStream)getOutputStream()).resetBuffer();
            _status= __200_OK;
            _reason=null;
            super.reset();

            setField(HttpFields.__Date,getRequest().getTimeStampStr());
            if (!Version.isParanoid())
                setField(HttpFields.__Server,Version.getDetail());
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            throw new IllegalStateException(e.toString());
        }
    }
    
    
    /* ------------------------------------------------------------ */
    /**
     * @deprecated use getHttpRequest()
     */
    public HttpRequest getRequest()
    {
        return getHttpRequest();
    }
    
    /* ------------------------------------------------------------ */
    /** Get the HTTP Request.
     * Get the HTTP Request associated with this response.
     * @return associated request
     */
    public HttpRequest getHttpRequest()
    {
        if (_connection==null)
            return null;
        return _connection.getRequest();
    }
    
    /* ------------------------------------------------------------ */
    /** Not Implemented.
     * @param in 
     * @exception IOException 
     */
    public void readHeader(HttpInputStream in)
        throws IOException
    {
        _state=__MSG_BAD;
        log.warn(LogSupport.NOT_IMPLEMENTED);
    }
    
    
    /* -------------------------------------------------------------- */
    public void writeHeader(Writer writer) 
        throws IOException
    {
        if (_state!=__MSG_EDITABLE)
            throw new IllegalStateException(__state[_state]+
                                            " is not EDITABLE");
        if (_header==null)
            throw new IllegalStateException("Response is destroyed");

        if (getHttpRequest().getDotVersion()>=0)
        {
            _state=__MSG_BAD;
            writer.write(_version);
            writer.write(' ');
            writer.write('0'+((_status/100)%10));
            writer.write('0'+((_status/10)%10));
            writer.write('0'+(_status%10));
            writer.write(' ');
            writer.write(getReason());
            writer.write(HttpFields.__CRLF);
            _header.write(writer);
        }
        _state=__MSG_SENDING;
    }
    
    /* -------------------------------------------------------------- */
    public int getStatus()
    {
        return _status;
    }
    
    /* -------------------------------------------------------------- */
    public void setStatus(int status)
    {
        _status=status;
    }
    
    /* -------------------------------------------------------------- */
    public String getReason()
    {
        if (_reason!=null)
            return _reason;
        _reason=(String)__statusMsg.get(TypeUtil.newInteger(_status));
        if (_reason==null)
            _reason="unknown";
        return _reason;
    }
    
    /* -------------------------------------------------------------- */
    public void setReason(String reason)
    {
        _reason=reason;
    }
    

    /* -------------------------------------------------------------- */
    public void setStatus(int code,String message)
    {
        setStatus(code);
        Integer code_integer=TypeUtil.newInteger(code);
        if (message == null)
        {
            message = (String)__statusMsg.get(code_integer);
            if (message==null)
                message=""+code;
            setReason(message);
        }
        else
            setReason(UrlEncoded.encodeString(message));
    }
      
    
    /* ------------------------------------------------------------- */
    /** Send Error Response.
     */
    public void sendError(int code,String message) 
        throws IOException
    {        
        setStatus(code,message);
        
        // Generate normal error page.
        HttpRequest request=getHttpRequest();
        
        // If we are allowed to have a body 
        if (code!=__204_No_Content &&
            code!=__304_Not_Modified &&
            code!=__206_Partial_Content &&
            code>=200)
        {
            if (getHttpContext()!=null)
            {   
                Object o=
                    getHttpContext().getAttribute(HttpContext.__ErrorHandler);
                if (o!=null && o instanceof HttpHandler)
                    ((HttpHandler)o).handle(request.getPath(), null, request, this);
            }
        }
        else if (code!=__206_Partial_Content) 
        {
            _header.remove(HttpFields.__ContentType);
            _header.remove(HttpFields.__ContentLength);
            _characterEncoding=null;
            _mimeType=null;
        }
        
        commit();
    }
    
    
    
    /* ------------------------------------------------------------- */
    /**
     * Sends an error response to the client using the specified status
     * code and no default message.
     * @param code the status code
     * @exception IOException If an I/O error has occurred.
     */
    public void sendError(int code) 
        throws IOException
    {
        sendError(code,null);
    }
    
    /* ------------------------------------------------------------- */
    /**
     * Sends a redirect response to the client using the specified redirect
     * location URL.
     * @param location the redirect location URL
     * @exception IOException If an I/O error has occurred.
     */
    public void sendRedirect(String location)
        throws IOException
    {
        if (isCommitted())
            throw new IllegalStateException("Commited");
        _header.put(HttpFields.__Location,location);
        setStatus(__302_Moved_Temporarily);
        commit();
    }

    /* -------------------------------------------------------------- */
    /** Add a Set-Cookie field.
     */
    public void addSetCookie(String name,
                             String value)
    {
        _header.addSetCookie(new Cookie(name,value));
    }
    
    /* -------------------------------------------------------------- */
    /** Add a Set-Cookie field.
     */
    public void addSetCookie(Cookie cookie)
    {
        _header.addSetCookie(cookie);
    }
    

    /* ------------------------------------------------------------ */
    public void completing()
    {
        getHttpConnection().completing();
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @exception IOException 
     */
    public void commit()
        throws IOException
    {
        if (!isCommitted())
            getOutputStream().flush();
        getHttpConnection().commit();
    }
    
    /* ------------------------------------------------------------ */
    /** Recycle the response.
     */
    void recycle(HttpConnection connection)
    {
        super.recycle(connection);
        _status=__200_OK;
        _reason=null;
        _httpContext=null;
    }
    
    /* ------------------------------------------------------------ */
    /** Destroy the response.
     * Help the garbage collector by null everything that we can.
     */
    public void destroy()
    {
        _reason=null;
        super.destroy();
    }

}



