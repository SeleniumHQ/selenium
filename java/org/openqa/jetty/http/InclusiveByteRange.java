// ========================================================================
// $Id: InclusiveByteRange.java,v 1.11 2005/08/13 00:01:24 gregwilkins Exp $
// Copyright 2002-2004 Mort Bay Consulting Pty. Ltd.
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

import java.util.Enumeration;
import java.util.List;
import java.util.StringTokenizer;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LazyList;
import org.openqa.jetty.util.LogSupport;

/* ------------------------------------------------------------ */
/** Byte range inclusive of end points.
 * <PRE>
 * 
 *   parses the following types of byte ranges:
 * 
 *       bytes=100-499
 *       bytes=-300
 *       bytes=100-
 *       bytes=1-2,2-3,6-,-2
 *
 *   given an entity length, converts range to string
 * 
 *       bytes 100-499/500
 * 
 * </PRE>
 * 
 * Based on RFC2616 3.12, 14.16, 14.35.1, 14.35.2
 * @version $version$
 * @author Helmut Hissen
 */
public class InclusiveByteRange {
    private static Log log = LogFactory.getLog(InclusiveByteRange.class);


    long first = 0;
    long last  = 0;    

    public InclusiveByteRange(long first, long last)
    {
        this.first = first;
        this.last = last;
    }
    
    public long getFirst()
    {
        return first;
    }

    public long getLast()
    {
        return last;
    }    


    
    /* ------------------------------------------------------------ */
    /** 
     * @param headers Enumeration of Range header fields.
     * @param size Size of the resource.
     * @return LazyList of satisfiable ranges
     */
    public static List satisfiableRanges(Enumeration headers,long size)
    {
        Object satRanges=null;
        
        // walk through all Range headers
    headers:
        while (headers.hasMoreElements())
        {
            String header = (String) headers.nextElement();
            StringTokenizer tok = new StringTokenizer(header,"=,",false);
            String t=null;
            try
            {
                // read all byte ranges for this header 
                while (tok.hasMoreTokens())
                {
                    t=tok.nextToken().trim();
                    
                    long first = -1;
                    long last  = -1;
                    int d=t.indexOf('-');
                    if (d<0 || t.indexOf("-",d+1)>=0)
                    {           
                        if ("bytes".equals(t))
                            continue;
                        log.warn("Bad range format: "+t);
                        continue headers;
                    }
                    else if (d==0)
                    {
                        if (d+1<t.length())
                            last = Long.parseLong(t.substring(d+1).trim());
                        else
                        {
                            log.warn("Bad range format: "+t);
                            continue headers;
                        }
                    }
                    else if (d+1<t.length())
                    {
                        first = Long.parseLong(t.substring(0,d).trim());
                        last = Long.parseLong(t.substring(d+1).trim());
                    }
                    else
                        first = Long.parseLong(t.substring(0,d).trim());

                    
                    if (first == -1 && last == -1)
                        continue headers;
                    
                    if (first != -1 && last != -1 && (first > last))
                        continue headers;

                    if (first<size)
                    {
                        InclusiveByteRange range = new
                            InclusiveByteRange(first, last);
                        satRanges=LazyList.add(satRanges,range);
                    }
                }
            }
            catch(Exception e)
            {
                log.warn("Bad range format: "+t);
                LogSupport.ignore(log,e);
            }    
        }
        return LazyList.getList(satRanges,true);
    }

    /* ------------------------------------------------------------ */
    public long getFirst(long size)
    {
        if (first<0)
        {
            long tf=size-last;
            if (tf<0)
                tf=0;
            return tf;
        }
        return first;
    }
    
    /* ------------------------------------------------------------ */
    public long getLast(long size)
    {
        if (first<0)
            return size-1;
        
        if (last<0 ||last>=size)
            return size-1;
        return last;
    }
    
    /* ------------------------------------------------------------ */
    public long getSize(long size)
    {
        return getLast(size)-getFirst(size)+1;
    }


    /* ------------------------------------------------------------ */
    public String toHeaderRangeString(long size)
    {
        StringBuffer sb = new StringBuffer(40);
        sb.append("bytes ");
        sb.append(getFirst(size));
        sb.append('-');
        sb.append(getLast(size));
        sb.append("/");
        sb.append(size);
        return sb.toString();
    }

    /* ------------------------------------------------------------ */
    public static String to416HeaderRangeString(long size)
    {
        StringBuffer sb = new StringBuffer(40);
        sb.append("bytes */");
        sb.append(size);
        return sb.toString();
    }


    /* ------------------------------------------------------------ */
    public String toString()
    {
        StringBuffer sb = new StringBuffer(60);
        sb.append(Long.toString(first));
        sb.append(":");
        sb.append(Long.toString(last));
        return sb.toString();
    }

    

}



