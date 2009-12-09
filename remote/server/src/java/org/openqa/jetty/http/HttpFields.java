// ========================================================================
// $Id: HttpFields.java,v 1.77 2006/11/22 20:02:15 gregwilkins Exp $
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
import java.io.StringWriter;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.Enumeration;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.StringTokenizer;
import java.util.TimeZone;

import javax.servlet.http.Cookie;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.DateCache;
import org.openqa.jetty.util.LazyList;
import org.openqa.jetty.util.LineInput;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.QuotedStringTokenizer;
import org.openqa.jetty.util.StringMap;
import org.openqa.jetty.util.StringUtil;
import org.openqa.jetty.util.URI;

/* ------------------------------------------------------------ */
/** HTTP Fields.
 * A collection of HTTP header and or Trailer fields.
 * This class is not synchronized and needs to be protected from
 * concurrent access.
 *
 * This class is not synchronized as it is expected that modifications
 * will only be performed by a single thread.
 *
 * @version $Id: HttpFields.java,v 1.77 2006/11/22 20:02:15 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class HttpFields
{
    private static Log log = LogFactory.getLog(HttpFields.class);
        
    /* ------------------------------------------------------------ */
    /** General Fields.
     */
    public final static String
        __CacheControl = "Cache-Control",
        __Connection = "Connection",
        __Date = "Date",
        __Pragma = "Pragma",
        __ProxyConnection = "Proxy-Connection",
        __Trailer = "Trailer",
        __TransferEncoding = "Transfer-Encoding",
        __Upgrade = "Upgrade",
        __Via = "Via",
        __Warning = "Warning";
        
    /* ------------------------------------------------------------ */
    /** Entity Fields.
     */
    public final static String
        __Allow = "Allow",
        __ContentEncoding = "Content-Encoding",
        __ContentLanguage = "Content-Language",
        __ContentLength = "Content-Length",
        __ContentLocation = "Content-Location",
        __ContentMD5 = "Content-MD5",
        __ContentRange = "Content-Range",
        __ContentType = "Content-Type",
        __Expires = "Expires",
        __LastModified = "Last-Modified";
    
    /* ------------------------------------------------------------ */
    /** Request Fields.
     */
    public final static String
        __Accept = "Accept",
        __AcceptCharset = "Accept-Charset",
        __AcceptEncoding = "Accept-Encoding",
        __AcceptLanguage = "Accept-Language",
        __Authorization = "Authorization",
        __Expect = "Expect",
        __Forwarded = "Forwarded",
        __From = "From",
        __Host = "Host",
        __IfMatch = "If-Match",
        __IfModifiedSince = "If-Modified-Since",
        __IfNoneMatch = "If-None-Match",
        __IfRange = "If-Range",
        __IfUnmodifiedSince = "If-Unmodified-Since",
        __KeepAlive = "keep-alive",
        __MaxForwards = "Max-Forwards",
        __ProxyAuthorization = "Proxy-Authorization",
        __Range = "Range",
        __RequestRange = "Request-Range",
        __Referer = "Referer",
        __TE = "TE",
        __UserAgent = "User-Agent",
        __XForwardedFor = "X-Forwarded-For";
    

    /* ------------------------------------------------------------ */
    /** Response Fields.
     */
    public final static String
        __AcceptRanges = "Accept-Ranges",
        __Age = "Age",
        __ETag = "ETag",
        __Location = "Location",
        __ProxyAuthenticate = "Proxy-Authenticate",
        __RetryAfter = "Retry-After",
        __Server = "Server",
        __ServletEngine = "Servlet-Engine",
        __Vary = "Vary",
        __WwwAuthenticate = "WWW-Authenticate";
     
    /* ------------------------------------------------------------ */
    /** Other Fields.
     */
    public final static String
        __Cookie = "Cookie",
        __SetCookie = "Set-Cookie",
        __SetCookie2 = "Set-Cookie2",
        __MimeVersion ="MIME-Version",
        __Identity ="identity",
        __SoapAction ="SOAPAction";

    /* ------------------------------------------------------------ */
    /** Private class to hold Field name info
     */
    private static final class FieldInfo
    {
        String _name;
        String _lname;
        boolean _inlineValues;
        int _hashCode;
        static int __hashCode;
        
        FieldInfo(String name, boolean inline)
        {
            synchronized(FieldInfo.class)
            {
                _name=name;
                _lname=StringUtil.asciiToLowerCase(name);
                _inlineValues=inline;
                
                _hashCode=__hashCode++;
                
                if (__hashCode < __maxCacheSize)
                {
                    FieldInfo oldInfo = (FieldInfo)__info.get(name);
                    if (oldInfo == null)
                    {
                        __info.put(name, this);
                        if (!name.equals(_lname))
                            __info.put(_lname, this);
                    }
                    else
                        _hashCode = oldInfo._hashCode;
                }
            }
        }

        public String toString()
        {
            return "["+_name+","+_hashCode+","+_inlineValues+"]";
        }

        public int hashCode()
        {
            return _hashCode;
        }

        public boolean equals(Object o)
        {
            if (o==null || !(o instanceof FieldInfo))
                return false;
            FieldInfo fi = (FieldInfo)o;
            return
                fi==this ||
                fi._hashCode==_hashCode ||
                fi._name.equals(_name);
        }
    }

    /* ------------------------------------------------------------ */
    private static final StringMap __info = new StringMap(true);
    private static final StringMap __values = new StringMap(true);
    private static final int __maxCacheSize=128;
    
    /* ------------------------------------------------------------ */
    static
    {
        // Initialize FieldInfo's with special values.
        // In order of most frequently used.
        new FieldInfo(__Host,false);
        
        new FieldInfo(__KeepAlive,false);
        new FieldInfo(__Connection,false);
        
        new FieldInfo(__Cookie,false);
        
        new FieldInfo(__Accept,false);
        new FieldInfo(__AcceptLanguage,false);
        new FieldInfo(__AcceptEncoding,false);
        new FieldInfo(__AcceptCharset,false);
        new FieldInfo(__CacheControl,false);
        new FieldInfo(__SetCookie,false);
        new FieldInfo(__SetCookie2,false);
        
        new FieldInfo(__Date,false);
        new FieldInfo(__TransferEncoding,true);
        new FieldInfo(__ContentEncoding,true);
        new FieldInfo(__ContentLength,false);
        new FieldInfo(__Expires,false);
        new FieldInfo(__Expect,false);
        
        new FieldInfo(__Referer,false);
        new FieldInfo(__TE,false);
        new FieldInfo(__UserAgent,false);
        
        new FieldInfo(__IfModifiedSince,false);
        new FieldInfo(__IfRange,false);
        new FieldInfo(__IfUnmodifiedSince,false);

        new FieldInfo(__Location,false);
        new FieldInfo(__Server,false);
        new FieldInfo(__ServletEngine,false);
        
        new FieldInfo(__AcceptRanges,false);
        new FieldInfo(__Range,false);
        new FieldInfo(__RequestRange,false);

        new FieldInfo(__SoapAction,false);
        
        new FieldInfo(__ContentLocation,false);
        new FieldInfo(__ContentMD5,false);
        new FieldInfo(__ContentRange,false);
        new FieldInfo(__ContentType,false);
        new FieldInfo(__LastModified,false);
        new FieldInfo(__Authorization,false);
        new FieldInfo(__From,false);
        new FieldInfo(__MaxForwards,false);
        new FieldInfo(__ProxyAuthenticate,false);
        new FieldInfo(__Age,false);
        new FieldInfo(__ETag,false);
        new FieldInfo(__RetryAfter,false);

        
    }
    
    /* ------------------------------------------------------------ */
    private static FieldInfo getFieldInfo(String name)
    {
        FieldInfo info = (FieldInfo)__info.get(name);
        if (info==null)
            info = new FieldInfo(name,false);
        return info;
    }
    
    /* ------------------------------------------------------------ */
    private static FieldInfo getFieldInfo(char[] name,int offset,int length)
    {
        Map.Entry entry = __info.getEntry(name,offset,length);
        if (entry==null)
            return new FieldInfo(new String(name,offset,length),false);

        return (FieldInfo) entry.getValue();
    }
    
    /* ------------------------------------------------------------ */
    /** Fields Values.
     */    
    public final static String __Chunked = "chunked";
    public final static String __Close = "close";
    public final static String __TextHtml = "text/html";
    public final static String __MessageHttp = "message/http";
    public final static String __WwwFormUrlEncode =
        "application/x-www-form-urlencoded";
    public static final String __ExpectContinue="100-continue";

    static
    {
        __values.put(__KeepAlive,__KeepAlive);
        __values.put(__Chunked,__Chunked);
        __values.put(__Close,__Close);
        __values.put(__TextHtml,__TextHtml);
        __values.put(__MessageHttp,__MessageHttp);
        __values.put(__WwwFormUrlEncode,__WwwFormUrlEncode);
        __values.put(__ExpectContinue,__ExpectContinue);
        __values.put("max-age=0","max-age=0");
        __values.put("no-cache","no-cache");
        __values.put("300","300");
        __values.put("ISO-8859-1, utf-8;q=0.66, *;q=0.66","ISO-8859-1, utf-8;q=0.66, *;q=0.66");
    }
    
    /* ------------------------------------------------------------ */
    public final static String __separators = ", \t";    

    /* ------------------------------------------------------------ */
    public final static char[] __CRLF = {'\015','\012'};
    public final static char[] __COLON = {':',' '};

    /* ------------------------------------------------------------ */
    private static String[] DAYS= { "Sat","Sun","Mon","Tue","Wed","Thu","Fri","Sat" };
    private static String[] MONTHS= { "Jan","Feb","Mar","Apr","May","Jun",
                                      "Jul","Aug","Sep","Oct","Nov","Dec","Jan" };


    /* ------------------------------------------------------------ */
    /** Format HTTP date
     * "EEE, dd MMM yyyy HH:mm:ss 'GMT'" or 
     * "EEE, dd-MMM-yy HH:mm:ss 'GMT'"for cookies
     */
    public static String formatDate(long date, boolean cookie)
    {
        StringBuffer buf = new StringBuffer(32);
        HttpCal gc = new HttpCal();
        gc.setTimeInMillis(date);
        formatDate(buf,gc,cookie);
        return buf.toString();
    } 

    /* ------------------------------------------------------------ */
    /** Format HTTP date
     * "EEE, dd MMM yyyy HH:mm:ss 'GMT'" or 
     * "EEE, dd-MMM-yy HH:mm:ss 'GMT'"for cookies
     */
    public static String formatDate(Calendar calendar, boolean cookie)
    {
        StringBuffer buf = new StringBuffer(32);
        formatDate(buf,calendar,cookie);
        return buf.toString();
    }

    /* ------------------------------------------------------------ */
    /** Format HTTP date
     * "EEE, dd MMM yyyy HH:mm:ss 'GMT'" or 
     * "EEE, dd-MMM-yy HH:mm:ss 'GMT'"for cookies
     */
    public static String formatDate(StringBuffer buf, long date, boolean cookie)
    {
        HttpCal gc = new HttpCal();
        gc.setTimeInMillis(date);
        formatDate(buf,gc,cookie);
        return buf.toString();
    } 

    /* ------------------------------------------------------------ */
    /** Format HTTP date
     * "EEE, dd MMM yyyy HH:mm:ss 'GMT'" or 
     * "EEE, dd-MMM-yy HH:mm:ss 'GMT'"for cookies
     */
    public static void formatDate(StringBuffer buf,Calendar calendar, boolean cookie)
    {
        // "EEE, dd MMM yyyy HH:mm:ss 'GMT'"
        // "EEE, dd-MMM-yy HH:mm:ss 'GMT'",     cookie
        
        int day_of_week  = calendar.get(Calendar.DAY_OF_WEEK);
        int day_of_month = calendar.get(Calendar.DAY_OF_MONTH);
        int month = calendar.get(Calendar.MONTH);
        int year = calendar.get(Calendar.YEAR);
        int century = year/100;
        year=year%100;

        long tm = (calendar instanceof HttpCal)?(((HttpCal)calendar).getTimeInMillis()):calendar.getTime().getTime();
        int epoch=(int)((tm/1000) % (60*60*24));
        int seconds=epoch%60;
        epoch=epoch/60;
        int minutes=epoch%60;
        int hours=epoch/60;
        
        buf.append(DAYS[day_of_week]);
        buf.append(',');
        buf.append(' ');
        StringUtil.append2digits(buf,day_of_month);
        
        if (cookie)
        {
            buf.append('-');
            buf.append(MONTHS[month]);
            buf.append('-');
            StringUtil.append2digits(buf,year);
        }
        else
        {
            buf.append(' ');
            buf.append(MONTHS[month]);
            buf.append(' ');
            StringUtil.append2digits(buf,century);
            StringUtil.append2digits(buf,year);
        }
        buf.append(' ');
        StringUtil.append2digits(buf,hours);
        buf.append(':');
        StringUtil.append2digits(buf,minutes);
        buf.append(':');
        StringUtil.append2digits(buf,seconds);
        buf.append(" GMT");
    }    

    /* -------------------------------------------------------------- */
    private static TimeZone __GMT = TimeZone.getTimeZone("GMT");
    public final static DateCache __dateCache = 
        new DateCache("EEE, dd MMM yyyy HH:mm:ss 'GMT'",
                      Locale.US);     
    
    /* ------------------------------------------------------------ */
    private final static String __dateReceiveFmt[] =
    {
        "EEE, dd MMM yyyy HH:mm:ss zzz",
        "EEE, dd-MMM-yy HH:mm:ss zzz",
        "EEE MMM dd HH:mm:ss yyyy",
        "EEE, dd MMM yyyy HH:mm:ss zzz",
        "EEE, dd-MMM-yy HH:mm:ss zzz",
        "dd MMM yyyy HH:mm:ss",
        "dd-MMM-yy HH:mm:ss",
    };
    public static SimpleDateFormat __dateReceiveSource[];
    public static final ThreadLocal __dateReceiveCache=new ThreadLocal();
    static
    {
        __GMT.setID("GMT");
        __dateCache.setTimeZone(__GMT); 
        __dateReceiveSource = new SimpleDateFormat[__dateReceiveFmt.length];
        for(int i=0;i<__dateReceiveSource.length;i++)
        {
            __dateReceiveSource[i] =
                new SimpleDateFormat(__dateReceiveFmt[i],Locale.US);
            __dateReceiveSource[i].setTimeZone(__GMT);
        }
    }                 
    
    public final static String __01Jan1970=HttpFields.formatDate(0,false);


    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static final class Field
    {
        FieldInfo _info;
        String _value;
        Field _next;
        Field _prev;
        int _version;

        /* ------------------------------------------------------------ */
        Field(FieldInfo info, String value, int version)
        {
            _info=info;
            _value=value;
            _next=null;
            _prev=null;
            _version=version;
        }
        
        /* ------------------------------------------------------------ */
        Field(FieldInfo info, char[] buf, int offset, int length, int version)
        {
            Map.Entry valueEntry=__values.getEntry(buf,offset,length);
            String value=null;
            if (valueEntry!=null)
                value=(String)valueEntry.getKey();
            else
                value=new String(buf,offset,length);
            
            _info=info;
            _value=value;
            _next=null;
            _prev=null;
            _version=version;
        }
        
        /* ------------------------------------------------------------ */
        public boolean equals(Object o)
        {
            return (o instanceof Field) &&
                o==this &&
                _version==((Field)o)._version;
        }

        /* ------------------------------------------------------------ */
        public int hashCode()
        {
            return _info.hashCode()*_version;
        }
        
        /* ------------------------------------------------------------ */
        void clear()
        {
            _version=-1;
        }
        
        /* ------------------------------------------------------------ */
        void destroy()
        {
            _info=null;
            _value=null;
            _next=null;
            _prev=null;
            _version=-1;
        }
        
        /* ------------------------------------------------------------ */
        void reset(String value,int version)
        {
            _value=value;
            _version=version;
        }
        
        /* ------------------------------------------------------------ */
        /** Reassign a value to this field.
         * Checks if the value is the same as that in the char array, if so
         * then just reuse existing value.
         */
        void reset(char[] buf, int offset, int length, int version)
        {  
            _version=version;
            if (!StringUtil.equals(_value,buf,offset,length))
            {
                Map.Entry valueEntry=__values.getEntry(buf,offset,length);
                String value=null;
                if (valueEntry!=null)
                    value=(String)valueEntry.getKey();
                else
                    value=new String(buf,offset,length);
                _value=value;
            }
        }

        
        /* ------------------------------------------------------------ */
        void write(Writer writer, int version)
            throws IOException
        {
            if (_info==null || _version!=version)
                return;
            if (_info._inlineValues)
            {
                if (_prev!=null)
                    return;
                writer.write(_info._name);
                writer.write(__COLON);
                Field f=this;
                while (true)
                {
                    writer.write(QuotedStringTokenizer.quote(f._value,", \t"));
                    f=f._next;
                    if (f==null)
                        break;
                    writer.write(",");
                }
                writer.write(__CRLF);
            }
            else
            {
                writer.write(_info._name);
                writer.write(__COLON);
                writer.write(_value);
                writer.write(__CRLF);
            }
        }

        /* ------------------------------------------------------------ */
        String getDisplayName()
        {
            return _info._name;
        }
        
        /* ------------------------------------------------------------ */
        public String toString()
        {
            return ("["+
                (_prev==null?"":"<-")+
                getDisplayName()+"="+_value+
                (_next==null?"":"->")+
                "]");
        }
    }
    
    /* ------------------------------------------------------------ */
    private static Float __one = new Float("1.0");
    private static Float __zero = new Float("0.0");
    private static StringMap __qualities=new StringMap();
    static
    {
        __qualities.put(null,__one);
        __qualities.put("1.0",__one);
        __qualities.put("1",__one);
        __qualities.put("0.9",new Float("0.9"));
        __qualities.put("0.8",new Float("0.8"));
        __qualities.put("0.7",new Float("0.7"));
        __qualities.put("0.66",new Float("0.66"));
        __qualities.put("0.6",new Float("0.6"));
        __qualities.put("0.5",new Float("0.5"));
        __qualities.put("0.4",new Float("0.4"));
        __qualities.put("0.33",new Float("0.33"));
        __qualities.put("0.3",new Float("0.3"));
        __qualities.put("0.2",new Float("0.2"));
        __qualities.put("0.1",new Float("0.1"));
        __qualities.put("0",__zero);
        __qualities.put("0.0",__zero);
    }
    
    
    /* -------------------------------------------------------------- */
    private ArrayList _fields=new ArrayList(15);
    private int[] _index=new int[__maxCacheSize];
    private int _version;
    private SimpleDateFormat _dateReceive[]; 
    private StringBuffer _dateBuffer;
    private HttpCal _calendar;

    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    public HttpFields()
    {
        Arrays.fill(_index,-1);
    }

    
    /* ------------------------------------------------------------ */
    public int size()
    {
        return _fields.size();
    }
    
    /* -------------------------------------------------------------- */
    /** Get enumeration of header _names.
     * Returns an enumeration of strings representing the header _names
     * for this request. 
     */
    public Enumeration getFieldNames()
    {
        return new Enumeration()
            {
                int i=0;
                Field field=null;

                public boolean hasMoreElements()
                {
                    if (field!=null)
                        return true;
                    while (i<_fields.size())
                    {
                        Field f=(Field)_fields.get(i++);
                        if (f!=null && f._version==_version && f._prev==null)
                        {
                            field=f;
                            return true;
                        }
                    }
                    return false;
                }

                public Object nextElement()
                    throws NoSuchElementException
                {
                    if (field!=null || hasMoreElements())
                    {
                        String n=field._info._name;
                        field=null;
                        return n;
                    }
                    throw new NoSuchElementException();
                }
            };
    }
    
    /* ------------------------------------------------------------ */
    Field getField(String name)
    {       
        FieldInfo info=getFieldInfo(name);
        return getField(info,true);
    }
        
    /* ------------------------------------------------------------ */
    Field getField(FieldInfo info, boolean getValid)
    {
        int hi=info.hashCode();
        
        if (hi<_index.length)
        {
            if (_index[hi]>=0)
            {
                Field field=(Field)(_fields.get(_index[hi]));
                
                return (field!=null && (!getValid||field._version==_version))?field:null;
            }
        }
        else
        {    
            for (int i=0;i<_fields.size();i++)
            {
                Field field=(Field)_fields.get(i);
                if (info.equals(field._info) && (!getValid||field._version==_version))
                    return field;
            }
        }
        return null;
    }    
    
    /* ------------------------------------------------------------ */
    public boolean containsKey(String name)
    {
        FieldInfo info=getFieldInfo(name);
        return getField(info,true)!=null;
    }
    
    /* -------------------------------------------------------------- */
    /**
     * @return the value of a field, or null if not found. For
     * multiple fields of the same name, only the first is returned.
     * @param name the case-insensitive field name
     */
    public String get(String name)
    {
        FieldInfo info=getFieldInfo(name);
        Field field=getField(info,true);
        if (field!=null)
            return field._value;
        return null;
    }
    
    /* -------------------------------------------------------------- */
    /** Get multi headers
     * @return Enumeration of the values, or null if no such header.
     * @param name the case-insensitive field name
     */
    public Enumeration getValues(String name)
    {
        FieldInfo info=getFieldInfo(name);
        final Field field=getField(info,true);

        if (field!=null)
        {            
            return new Enumeration()
                {
                    Field f=field;
                    
                    public boolean hasMoreElements()
                    {
                        while (f!=null && f._version!=_version)
                            f=f._next;
                        return f!=null;
                    }
                        
                    public Object nextElement()
                        throws NoSuchElementException
                    {
                        if (f==null)
                            throw new NoSuchElementException();
                        Field n=f;
                        do f=f._next; while (f!=null && f._version!=_version);
                        return n._value;
                    }
                };
        }
        return null;
    }
    
    /* -------------------------------------------------------------- */
    /** Get multi field values with separator.
     * The multiple values can be represented as separate headers of
     * the same name, or by a single header using the separator(s), or
     * a combination of both. Separators may be quoted.
     * @param name the case-insensitive field name
     * @param separators String of separators.
     * @return Enumeration of the values, or null if no such header.
     */
    public Enumeration getValues(String name,final String separators)
    {
        final Enumeration e = getValues(name);
        if (e==null)
            return null;
        return new Enumeration()
            {
                QuotedStringTokenizer tok=null;
                public boolean hasMoreElements()
                {
                    if (tok!=null && tok.hasMoreElements())
                            return true;
                    while (e.hasMoreElements())
                    {
                        String value=(String)e.nextElement();
                        tok=new QuotedStringTokenizer(value,separators,false,false);
                        if (tok.hasMoreElements())
                            return true;
                    }
                    tok=null;
                    return false;
                }
                        
                public Object nextElement()
                    throws NoSuchElementException
                {
                    if (!hasMoreElements())
                        throw new NoSuchElementException();
                    String next=(String) tok.nextElement();
		    if (next!=null)next=next.trim();
		    return next;
                }
            };
    }
    
    /* -------------------------------------------------------------- */
    /** Set a field.
     * @param name the name of the field
     * @param value the value of the field. If null the field is cleared.
     */
    public String put(String name,String value)
    {
        if (value==null)
            return remove(name);
        
        FieldInfo info=getFieldInfo(name);
        Field field=getField(info,false);
        // Look for value to replace.
        if (field!=null)
        {
            String old=(field._version==_version)?field._value:null;
            field.reset(value,_version);

            field=field._next;
            while(field!=null)
            {
                field.clear();
                field=field._next;
            }
            return old;    
        }
        else
        {
            // new value;
            field=new Field(info,value,_version);
            int hi=info.hashCode();
            if (hi<_index.length)
                _index[hi]=_fields.size();
            _fields.add(field);
            return null;
        }
    }
    
        
    /* -------------------------------------------------------------- */
    /** Set a field.
     * @param name the name of the field
     * @param list the List value of the field. If null the field is cleared.
     */
    public void put(String name,List list)
    {
        if (list==null || list.size()==0)
        {
            remove(name);
            return;
        }
        
        Object v=list.get(0);
        if (v!=null)
            put(name,v.toString());
        else
            remove(name);
        
        if (list.size()>1)
        {    
            java.util.Iterator iter = list.iterator();
            iter.next();
            while(iter.hasNext())
            {
                v=iter.next();
                if (v!=null)
                    add(name,v.toString());
            }
        }
    }

    
    /* -------------------------------------------------------------- */
    /** Add to or set a field.
     * If the field is allowed to have multiple values, add will add
     * multiple headers of the same name.
     * @param name the name of the field
     * @param value the value of the field.
     * @exception IllegalArgumentException If the name is a single
     *            valued field and already has a value.
     */
    public void add(String name,String value)
        throws IllegalArgumentException
    {
        if (value==null)
            throw new IllegalArgumentException("null value");
        
        FieldInfo info=getFieldInfo(name);
        Field field=getField(info,false);
        Field last=null;
        if (field!=null)
        {
            while(field!=null && field._version==_version)
            {
                last=field;
                field=field._next;
            }
        }

        if (field!=null)    
            field.reset(value,_version);
        else
        {
            // create the field
            field=new Field(info,value,_version);
            
            // look for chain to add too
            if(last!=null)
            {
                field._prev=last;
                last._next=field;    
            }
            else if (info.hashCode()<_index.length)
                _index[info.hashCode()]=_fields.size();
            
            _fields.add(field);
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Remove a field.
     * @param name 
     */
    public String remove(String name)
    {
        String old=null;
        FieldInfo info=getFieldInfo(name);
        Field field=getField(info,true);

        if (field!=null)
        {
            old=field._value;
            while(field!=null)
            {
                field.clear();
                field=field._next;
            }
        }
        
        return old;
    }
   
    /* -------------------------------------------------------------- */
    /** Get a header as an integer value.
     * Returns the value of an integer field or -1 if not found.
     * The case of the field name is ignored.
     * @param name the case-insensitive field name
     * @exception NumberFormatException If bad integer found
     */
    public int getIntField(String name)
        throws NumberFormatException
    {
        String val = valueParameters(get(name),null);
        if (val!=null)
            return Integer.parseInt(val);
        return -1;
    }
    
    /* -------------------------------------------------------------- */
    /** Get a header as a date value.
     * Returns the value of a date field, or -1 if not found.
     * The case of the field name is ignored.
     * @param name the case-insensitive field name
     */
    public long getDateField(String name)
    {
        String val = valueParameters(get(name),null);
        if (val==null)
            return -1;

        if (_dateReceive==null)
       {
               _dateReceive=(SimpleDateFormat[])__dateReceiveCache.get();
               if (_dateReceive==null)
               {
                    _dateReceive=(SimpleDateFormat[]) new SimpleDateFormat[__dateReceiveSource.length];
                    __dateReceiveCache.set(_dateReceive);
               }
       }
       
        for (int i=0;i<_dateReceive.length;i++)
        {
            // clone formatter for thread safety
            if (_dateReceive[i]==null)
                _dateReceive[i]=(SimpleDateFormat)__dateReceiveSource[i].clone();
            
            try{
                Date date=(Date)_dateReceive[i].parseObject(val);
                return date.getTime();
            }
            catch(java.lang.Exception e)
            {
                LogSupport.ignore(log,e);
            }
        }
        if (val.endsWith(" GMT"))
        {
            val=val.substring(0,val.length()-4);
            for (int i=0;i<_dateReceive.length;i++)
            {
                try{
                    Date date=(Date)_dateReceive[i].parseObject(val);
                    return date.getTime();
                }
                catch(java.lang.Exception e)
                {
                    LogSupport.ignore(log,e);
                }
            }
        }

        throw new IllegalArgumentException(val);
    }
    
    /* -------------------------------------------------------------- */
    /**
     * Sets the value of an integer field.
     * @param name the field name
     * @param value the field integer value
     */
    public void putIntField(String name, int value)
    {
        put(name, Integer.toString(value));
    }

    /* -------------------------------------------------------------- */
    /**
     * Sets the value of a date field.
     * @param name the field name
     * @param date the field date value
     */
    public void putDateField(String name, Date date)
    {
        putDateField(name,date.getTime());
    }
    
    /* -------------------------------------------------------------- */
    /**
     * Adds the value of a date field.
     * @param name the field name
     * @param date the field date value
     */
    public void addDateField(String name, Date date)
    {
        addDateField(name,date.getTime());
    }
    
    /* -------------------------------------------------------------- */
    /**
     * Adds the value of a date field.
     * @param name the field name
     * @param date the field date value
     */
    public void addDateField(String name, long date)
    {
        if (_dateBuffer==null)
        {
            _dateBuffer=new StringBuffer(32);
            _calendar=new HttpCal();
        }
        _dateBuffer.setLength(0);
        _calendar.setTimeInMillis(date);
        formatDate(_dateBuffer, _calendar, false);
        add(name, _dateBuffer.toString());
    }
    
    /* -------------------------------------------------------------- */
    /**
     * Sets the value of a date field.
     * @param name the field name
     * @param date the field date value
     */
    public void putDateField(String name, long date)
    {
        if (_dateBuffer==null)
        {
            _dateBuffer=new StringBuffer(32);
            _calendar=new HttpCal();
        }
        _dateBuffer.setLength(0);
        _calendar.setTimeInMillis(date);
        formatDate(_dateBuffer, _calendar, false);
        put(name, _dateBuffer.toString());
    }

    /* -------------------------------------------------------------- */
    /** Read HttpHeaders from inputStream.
     */
    public void read(LineInput in)
        throws IOException
    {  
        Field last=null;
        char[] buf=null;
        int size=0;
        org.openqa.jetty.util.LineInput.LineBuffer line_buffer;
        synchronized(in)
        {
            line:
            while ((line_buffer=in.readLineBuffer())!=null)
            {
                // check space in the lowercase buffer
                buf=line_buffer.buffer;
                size=line_buffer.size;
                if (size==0)
                    break;
                
                // setup loop state machine
                int i1=-1;
                int i2=-1;
                int name_l=0;
                int i=0;
                char c=buf[0];
                
                // Check for continuity line
                if (c!=' ' && c!='\t')
                {
                    i2=0;
                    // reading name upto :
                    for (i=1;i<size;i++)
                    {
                        c=buf[i];
                        if (c==':')
                        {
                            name_l=i2+1; 
                            break;
                        }
                        
                        if (c!=' '&&c!='\t')
                            i2=i;
                    }
                }   

                // skip whitespace after : or start of continuity line
                for (i++;i<size;i++)
                {
                    c=buf[i];
                    if (c!=' ' && c!='\t')
                    {
                        i1=i;
                        i2=i-1;
                        break;
                    }
                }
                
                // Reverse Parse the "name : value" to last char of value
                for (i=size;i-->i1 && i>=0;)
                {
                    c=buf[i];
                    if (c!=' ' && c!='\t')
                    {
                        i2=i;
                        break;
                    }
                }

                // If no name, it is a continuation line
                if (name_l<=0)
                {
                    if (i1>0 && last!=null)
                        last._value=last._value+' '+new String(buf,i1,i2-i1+1);
                    continue;
                }

                // create the field.
                FieldInfo info = getFieldInfo(buf,0,name_l);
                Field field=getField(info,false);
                last=null;
                if (field!=null)
                {
                    while(field!=null && field._version==_version)
                    {
                        last=field;
                        field=field._next;
                    }
                }
                
                if (field!=null)
                {
                    if (i1>=0)
                        field.reset(buf,i1,i2-i1+1,_version);
                    else
                        field.reset("",_version);
                }
                else
                {
                    // create the field
                    if (i1>=0)
                        field=new Field(info,buf,i1,i2-i1+1,_version);
                    else
                        field=new Field(info,"",_version);
                    
                    // look for chain to add too
                    if(last!=null)
                    {
                        field._prev=last;
                        last._next=field; 
                          
                    }
                    else if (info.hashCode()<_index.length)
                        _index[info.hashCode()]=_fields.size(); 
                    _fields.add(field);
                }
                
                last=field;
            }
        }
    }

    
    /* -------------------------------------------------------------- */
    /* Write Extra HTTP headers.
     */
    public void write(Writer writer)
        throws IOException
    {
        synchronized(writer)
        {
            for (int i=0;i<_fields.size();i++)
            {
                Field field=(Field)_fields.get(i);
                if (field!=null)
                    field.write(writer,_version);
            }
            writer.write(__CRLF);
        }
    }
    
    
    /* -------------------------------------------------------------- */
    public String toString()
    {
        try
        {
            StringWriter writer = new StringWriter();
            write(writer);
            return writer.toString();
        }
        catch(Exception e)
        {}
        return null;
    }

    /* ------------------------------------------------------------ */
    /** Clear the header.
     */
    public void clear()
    {
        _version++;
        if (_version>1000)
        {
            _version=0;
            for (int i=_fields.size();i-->0;)
            {
                Field field=(Field)_fields.get(i);
                if (field!=null)
                    field.clear();
            }
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Destroy the header.
     * Help the garbage collector by null everything that we can.
     */
    public void destroy()
    {   
        for (int i=_fields.size();i-->0;)
        {
            Field field=(Field)_fields.get(i);
            if (field!=null)
                field.destroy();
        }
        _fields=null;
        _index=null;
        _dateBuffer=null;
        _calendar=null;
        _dateReceive=null;
    }
    
    /* ------------------------------------------------------------ */
    /** Get field value parameters.
     * Some field values can have parameters.  This method separates
     * the value from the parameters and optionally populates a
     * map with the paramters. For example:<PRE>
     *   FieldName : Value ; param1=val1 ; param2=val2
     * </PRE>
     * @param value The Field value, possibly with parameteres.
     * @param parameters A map to populate with the parameters, or null
     * @return The value.
     */
    public static String valueParameters(String value, Map parameters)
    {
        if (value==null)
            return null;
        
        int i = value.indexOf(';');
        if (i<0)
            return value;
        if (parameters==null)
            return value.substring(0,i).trim();

        StringTokenizer tok1 =
            new QuotedStringTokenizer(value.substring(i),";",false,true);
        while(tok1.hasMoreTokens())
        {
            String token=tok1.nextToken();
            StringTokenizer tok2 =
                new QuotedStringTokenizer(token,"= ");
            if (tok2.hasMoreTokens())
            {
                String paramName=tok2.nextToken();
                String paramVal=null;
                if (tok2.hasMoreTokens())
                    paramVal=tok2.nextToken();
                parameters.put(paramName,paramVal);
            }
        }
        
        return value.substring(0,i).trim();
    }

    /* ------------------------------------------------------------ */
    public static Float getQuality(String value)
    {
        if (value==null)
            return __zero;
        
        int qe=value.indexOf(";");
        if (qe++<0 || qe==value.length())
            return __one;
        
        if (value.charAt(qe++)=='q')
        {
            qe++;
            Map.Entry entry=__qualities.getEntry(value,qe,value.length()-qe);
            if (entry!=null)
                return (Float)entry.getValue();
        }
        
        HashMap params = new HashMap(3);
        valueParameters(value,params);
        String qs=(String)params.get("q");
        Float q=(Float)__qualities.get(qs);
        if (q==null)
        {
            try{q=new Float(qs);}
            catch(Exception e){q=__one;}
        }
        return q;
    }

    /* ------------------------------------------------------------ */
    /** List values in quality order.
     * @param enm Enumeration of values with quality parameters
     * @return values in quality order.
     */
    public static List qualityList(Enumeration enm)
    {
        if(enm==null || !enm.hasMoreElements())
            return Collections.EMPTY_LIST;

        Object list=null;
        Object qual=null;

        // Assume list will be well ordered and just add nonzero
        while(enm.hasMoreElements())
        {
            String v=enm.nextElement().toString();
            Float q=getQuality(v);

            if (q.floatValue()>=0.001)
            {
                list=LazyList.add(list,v);
                qual=LazyList.add(qual,q);
            }
        }

        List vl=LazyList.getList(list,false);
        if (vl.size()<2)
            return vl;

        List ql=LazyList.getList(qual,false);

        // sort list with swaps
        Float last=__zero;
        for (int i=vl.size();i-->0;)
        {
            Float q = (Float)ql.get(i);
            if (last.compareTo(q)>0)
            {
                Object tmp=vl.get(i);
                vl.set(i,vl.get(i+1));
                vl.set(i+1,tmp);
                ql.set(i,ql.get(i+1));
                ql.set(i+1,q);
                last=__zero;
                i=vl.size();
                continue;
            }
            last=q;
        }
        ql.clear();
        return vl;
    }
    


    /* ------------------------------------------------------------ */
    /** Format a set cookie value
     * @param cookie The cookie.
     */
    public void addSetCookie(Cookie cookie)
    {
        String name=cookie.getName();
        String value=cookie.getValue();
        int version=cookie.getVersion();
        
        // Check arguments
        if (name==null || name.length()==0)
            throw new IllegalArgumentException("Bad cookie name");

        // Format value and params
        StringBuffer buf = new StringBuffer(128);
        String name_value_params=null;
        synchronized(buf)
        {
            buf.append(name);
            buf.append('=');
            if (value!=null && value.length()>0)
            {
                if (version==0)
                    URI.encodeString(buf,value,"\";, '");
                else
                    buf.append(QuotedStringTokenizer.quote(value,"\";, '"));
            }

            if (version>0)
            {
                buf.append(";Version=");
                buf.append(version);
                String comment=cookie.getComment();
                if (comment!=null && comment.length()>0)
                {
                    buf.append(";Comment=");
                    QuotedStringTokenizer.quote(buf,comment);
                }
            }
            String path=cookie.getPath();
            if (path!=null && path.length()>0)
            {
                buf.append(";Path=");
                buf.append(path);
            }
            String domain=cookie.getDomain();
            if (domain!=null && domain.length()>0)
            {
                buf.append(";Domain=");
                buf.append(domain.toLowerCase());// lowercase for IE
            }
            long maxAge = cookie.getMaxAge();
            if (maxAge>=0)
            {
                if (version==0)
                {
                    buf.append(";Expires=");
                    if (maxAge==0)
                        buf.append(__01Jan1970);
                    else
                        formatDate(buf,System.currentTimeMillis()+1000L*maxAge,true);
                }
                else
                {
                    buf.append (";Max-Age=");
                    buf.append (cookie.getMaxAge());
                }
            }
            else if (version>0)
            {
                buf.append (";Discard");
            }
            if (cookie.getSecure())
            {
                buf.append(";Secure");
            }
            if (cookie instanceof HttpOnlyCookie)
                buf.append(";HttpOnly");
            
            name_value_params = buf.toString();
        }
        put(__Expires,__01Jan1970);
        add(__SetCookie,name_value_params);
    }

    /* ------------------------------------------------------------ */
    /** Add fields from another HttpFields instance.
     * Single valued fields are replaced, while all others are added.
     * @param fields 
     */
    public void add(HttpFields fields)
    {
        if (fields==null)
            return;

        Enumeration enm = fields.getFieldNames();
        while( enm.hasMoreElements() )
        {
            String name = (String)enm.nextElement();
            Enumeration values = fields.getValues(name);
            while(values.hasMoreElements())
                add(name,(String)values.nextElement());
        }
    }

    /* ------------------------------------------------------------ */
    /** 
     * return an iterator for field name:value pairs
     * @return an HttpFields.Iterator
     */
    public Iterator iterator() {return new EntryIterator();}

    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    public class Entry
    {
        protected int _i;
        
        Entry(int i) {_i=i;}
        public String getKey() {return ((Field)_fields.get(_i)).getDisplayName();}
        public String getValue() {return ((Field)_fields.get(_i))._value;}
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class EntryIterator implements Iterator
    {
        protected int _i=0;
        public boolean hasNext() {return (_i<_fields.size());}
        public Object next() throws NoSuchElementException {return new Entry(_i++);}
        public void remove() { throw new UnsupportedOperationException();}
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* handle 1.3 protected methods                        */
    private static class HttpCal extends GregorianCalendar
    {
        HttpCal()
        {
            super(__GMT);
        }

        /* ------------------------------------------------------------------------------- */
        /**
         * @see java.util.Calendar#setTimeInMillis(long)
         */
        public void setTimeInMillis(long arg0)
        {
            super.setTimeInMillis(arg0);
        }
        /* ------------------------------------------------------------------------------- */
        /**
         * @see java.util.Calendar#getTimeInMillis()
         */
        public long getTimeInMillis()
        {
            return super.getTimeInMillis();
        }
    }
}
