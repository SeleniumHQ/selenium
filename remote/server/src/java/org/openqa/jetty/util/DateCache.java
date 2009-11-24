// ========================================================================
// $Id: DateCache.java,v 1.15 2004/05/09 20:32:49 gregwilkins Exp $
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

import java.text.DateFormatSymbols;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/* ------------------------------------------------------------ */
/**  Date Format Cache.
 * Computes String representations of Dates and caches
 * the results so that subsequent requests within the same minute
 * will be fast.
 *
 * Only format strings that contain either "ss" or "ss.SSS" are
 * handled.
 *
 * The timezone of the date may be included as an ID with the "zzz"
 * format string or as an offset with the "ZZZ" format string.
 *
 * If consecutive calls are frequently very different, then this
 * may be a little slower than a normal DateFormat.
 *
 * @version $Id: DateCache.java,v 1.15 2004/05/09 20:32:49 gregwilkins Exp $
 * @author Kent Johnson <KJohnson@transparent.com>
 * @author Greg Wilkins (gregw)
 */

public class DateCache  
{
    private static long __hitWindow=60*60;
    private static long __MaxMisses=10;
    
    private String _formatString;
    private String _tzFormatString;
    private SimpleDateFormat _tzFormat;
    
    private String _minFormatString;
    private SimpleDateFormat _minFormat;

    private String _secFormatString;
    private String _secFormatString0;
    private String _secFormatString1;

    private boolean _millis=false;
    private long _misses = 0;
    private long _lastMinutes = -1;
    private long _lastSeconds = -1;
    private String _lastResult = null;

    private Locale _locale	= null;
    private DateFormatSymbols	_dfs	= null;

    /* ------------------------------------------------------------ */
    /** Constructor.
     * Make a DateCache that will use a default format. The default format
     * generates the same results as Date.toString().
     */
    public DateCache()
    {
        this("EEE MMM dd HH:mm:ss zzz yyyy");
        getFormat().setTimeZone(TimeZone.getDefault());
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor.
     * Make a DateCache that will use the given format
     */
    public DateCache(String format)
    {
        _formatString=format;
        setTimeZone(TimeZone.getDefault());
        
    }
    
    /* ------------------------------------------------------------ */
    public DateCache(String format,Locale l)
    {
        _formatString=format;
        _locale = l;
        setTimeZone(TimeZone.getDefault());       
    }
    
    /* ------------------------------------------------------------ */
    public DateCache(String format,DateFormatSymbols s)
    {
        _formatString=format;
        _dfs = s;
        setTimeZone(TimeZone.getDefault());
    }

    /* ------------------------------------------------------------ */
    /** Set the timezone.
     * @param tz TimeZone
     */
    public void setTimeZone(TimeZone tz)
    {
        setTzFormatString(tz);        
        if( _locale != null ) 
        {
            _tzFormat=new SimpleDateFormat(_tzFormatString,_locale);
            _minFormat=new SimpleDateFormat(_minFormatString,_locale);
        }
        else if( _dfs != null ) 
        {
            _tzFormat=new SimpleDateFormat(_tzFormatString,_dfs);
            _minFormat=new SimpleDateFormat(_minFormatString,_dfs);
        }
        else 
        {
            _tzFormat=new SimpleDateFormat(_tzFormatString);
            _minFormat=new SimpleDateFormat(_minFormatString);
        }
        _tzFormat.setTimeZone(tz);
        _minFormat.setTimeZone(tz);
        _lastSeconds=-1;
        _lastMinutes=-1;        
    }

    /* ------------------------------------------------------------ */
    public TimeZone getTimeZone()
    {
        return _tzFormat.getTimeZone();
    }
    
    /* ------------------------------------------------------------ */
    /** Set the timezone.
     * @param timeZoneId TimeZoneId the ID of the zone as used by
     * TimeZone.getTimeZone(id)
     */
    public void setTimeZoneID(String timeZoneId)
    {
        setTimeZone(TimeZone.getTimeZone(timeZoneId));
    }
    
    /* ------------------------------------------------------------ */
    private void setTzFormatString(final  TimeZone tz )
    {
        int zIndex = _formatString.indexOf( "ZZZ" );
        if( zIndex >= 0 )
        {
            String ss1 = _formatString.substring( 0, zIndex );
            String ss2 = _formatString.substring( zIndex+3 );
            int tzOffset = tz.getRawOffset();
            
            StringBuffer sb = new StringBuffer(_formatString.length()+10);
            sb.append(ss1);
            sb.append("'");
            if( tzOffset >= 0 )
                sb.append( '+' );
            else
            {
                tzOffset = -tzOffset;
                sb.append( '-' );
            }
            
            int raw = tzOffset / (1000*60);		// Convert to seconds
            int hr = raw / 60;
            int min = raw % 60;
            
            if( hr < 10 )
                sb.append( '0' );
            sb.append( hr );
            if( min < 10 )
                sb.append( '0' );
            sb.append( min );
            sb.append( '\'' );
            
            sb.append(ss2);
            _tzFormatString=sb.toString();            
        }
        else
            _tzFormatString=_formatString;
        setMinFormatString();
    }

    
    /* ------------------------------------------------------------ */
    private void setMinFormatString()
    {
        int i = _tzFormatString.indexOf("ss.SSS");
        int l = 6;
        if (i>=0)
            _millis=true;
        else
        {
            i = _tzFormatString.indexOf("ss");
            l=2;
        }
        
        // Build a formatter that formats a second format string
        // Have to replace @ with ' later due to bug in SimpleDateFormat
        String ss1=_tzFormatString.substring(0,i);
        String ss2=_tzFormatString.substring(i+l);
        _minFormatString =ss1+(_millis?"'ss.SSS'":"'ss'")+ss2;
    }

    /* ------------------------------------------------------------ */
    /** Format a date according to our stored formatter.
     * @param inDate 
     * @return Formatted date
     */
    public synchronized String format(Date inDate)
    {
        return format(inDate.getTime());
    }
    
    /* ------------------------------------------------------------ */
    /** Format a date according to our stored formatter.
     * @param inDate 
     * @return Formatted date
     */
    public synchronized String format(long inDate)
    {
        long seconds = inDate / 1000;

        // Is it not suitable to cache?
        if (seconds<_lastSeconds ||
            _lastSeconds>0 && seconds>_lastSeconds+__hitWindow)
        {
            // It's a cache miss
            _misses++;
            if (_misses<__MaxMisses)
            {
                Date d = new Date(inDate);
                return _tzFormat.format(d);
            }    
        }
        else if (_misses>0)
            _misses--;
                                          
        // Check if we are in the same second
        // and don't care about millis
        if (_lastSeconds==seconds && !_millis)
            return _lastResult;

        Date d = new Date(inDate);
        
        // Check if we need a new format string
        long minutes = seconds/60;
        if (_lastMinutes != minutes)
        {
            _lastMinutes = minutes;
            _secFormatString=_minFormat.format(d);

            int i;
            int l;
            if (_millis)
            {
                i=_secFormatString.indexOf("ss.SSS");
                l=6;
            }
            else
            {
                i=_secFormatString.indexOf("ss");
                l=2;
            }
            _secFormatString0=_secFormatString.substring(0,i);
            _secFormatString1=_secFormatString.substring(i+l);
        }

        // Always format if we get here
        _lastSeconds = seconds;
        StringBuffer sb=new StringBuffer(_secFormatString.length());
        synchronized(sb)
        {
            sb.append(_secFormatString0);
            int s=(int)(seconds%60);
            if (s<10)
                sb.append('0');
            sb.append(s);
            if (_millis)
            {
                long millis = inDate%1000;
                if (millis<10)
                    sb.append(".00");
                else if (millis<100)
                    sb.append(".0");
                else
                    sb.append('.');
                sb.append(millis);
            }
            sb.append(_secFormatString1);
            _lastResult=sb.toString();
        }
                
        return _lastResult;
    }

    /* ------------------------------------------------------------ */
    /** Format to string buffer. 
     * @param inDate Date the format
     * @param buffer StringBuffer
     */
    public void format(long inDate, StringBuffer buffer)
    {
        buffer.append(format(inDate));
    }
    
    /* ------------------------------------------------------------ */
    /** Get the format.
     */
    public SimpleDateFormat getFormat()
    {
        return _minFormat;
    }

    /* ------------------------------------------------------------ */
    public String getFormatString()
    {
        return _formatString;
    } 
    
}
