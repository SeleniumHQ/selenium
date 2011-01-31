// ========================================================================
// $Id: UrlEncoded.java,v 1.24 2005/12/21 23:14:38 gregwilkins Exp $
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

package org.openqa.jetty.util;

import java.io.UnsupportedEncodingException;
import java.util.Iterator;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

/* ------------------------------------------------------------ */
/** Handles coding of MIME  "x-www-form-urlencoded".
 * This class handles the encoding and decoding for either
 * the query string of a URL or the content of a POST HTTP request.
 *
 * <p><h4>Notes</h4>
 * The hashtable either contains String single values, vectors
 * of String or arrays of Strings.
 *
 * This class is only partially synchronised.  In particular, simple
 * get operations are not protected from concurrent updates.
 *
 * @see java.net.URLEncoder
 * @version $Id: UrlEncoded.java,v 1.24 2005/12/21 23:14:38 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class UrlEncoded extends MultiMap
{
    private static Log log = LogFactory.getLog(UrlEncoded.class);

    /* ----------------------------------------------------------------- */
    public UrlEncoded(UrlEncoded url)
    {
        super(url);
    }
    
    /* ----------------------------------------------------------------- */
    public UrlEncoded()
    {
        super(6);
    }
    
    /* ----------------------------------------------------------------- */
    public UrlEncoded(String s)
    {
        super(6);
        decode(s,StringUtil.__ISO_8859_1);
    }
    
    /* ----------------------------------------------------------------- */
    public UrlEncoded(String s, String charset)
    {
        super(6);
        decode(s,charset);
    }
    
    /* ----------------------------------------------------------------- */
    public void decode(String query)
    {
        decodeTo(query,this,StringUtil.__ISO_8859_1);
    }
    
    /* ----------------------------------------------------------------- */
    public void decode(String query,String charset)
    {
        decodeTo(query,this,charset);
    }
    
    /* -------------------------------------------------------------- */
    /** Encode Hashtable with % encoding.
     */
    public String encode()
    {
        return encode(StringUtil.__ISO_8859_1,true);
    }
    
    /* -------------------------------------------------------------- */
    /** Encode Hashtable with % encoding.
     */
    public String encode(String charset)
    {
        return encode(charset,true);
    }
    
    /* -------------------------------------------------------------- */
    /** Encode Hashtable with % encoding.
     * @param equalsForNullValue if True, then an '=' is always used, even
     * for parameters without a value. e.g. "blah?a=&b=&c=".
     */
    public synchronized String encode(String charset, boolean equalsForNullValue)
    {
        if (charset==null)
            charset=StringUtil.__ISO_8859_1;
        
        StringBuffer result = new StringBuffer(128);
        synchronized(result)
        {
            Iterator iter = entrySet().iterator();
            while(iter.hasNext())
            {
                Map.Entry entry = (Map.Entry)iter.next();
                
                String key = entry.getKey().toString();
                Object list = entry.getValue();
                int s=LazyList.size(list);
                
                if (s==0)
                {
                    result.append(encodeString(key,charset));
                    if(equalsForNullValue)
                        result.append('=');
                }
                else
                {
                    for (int i=0;i<s;i++)
                    {
                        if (i>0)
                            result.append('&');
                        Object val=LazyList.get(list,i);
                        result.append(encodeString(key,charset));

                        if (val!=null)
                        {
                            String str=val.toString();
                            if (str.length()>0)
                            {
                                result.append('=');
                                result.append(encodeString(str,charset));
                            }
                            else if (equalsForNullValue)
                                result.append('=');
                        }
                        else if (equalsForNullValue)
                            result.append('=');
                    }
                }
                if (iter.hasNext())
                    result.append('&');
            }
            return result.toString();
        }
    }

    /* -------------------------------------------------------------- */
    /* Decoded parameters to Map.
     * @param content the string containing the encoded parameters
     * @param url The dictionary to add the parameters to
     */
    public static void decodeTo(String content,MultiMap map)
    {
        decodeTo(content,map,StringUtil.__ISO_8859_1);
    }
    


    /* -------------------------------------------------------------- */
    /** Decoded parameters to Map.
     * @param content the string containing the encoded parameters
     */
    public static void decodeTo(String content, MultiMap map, String charset)
    {
        if (charset==null)
            charset=StringUtil.__ISO_8859_1;

        synchronized(map)
        {
            String key = null;
            String value = null;
            int mark=-1;
            boolean encoded=false;
            for (int i=0;i<content.length();i++)
            {
                char c = content.charAt(i);
                switch (c)
                {
                  case '&':
                      value = encoded
                          ?decodeString(content,mark+1,i-mark-1,charset)
                          :content.substring(mark+1,i);
                      
                      mark=i;
                      encoded=false;
                      if (key != null)
                      {
                          map.add(key,value);
                          key = null;
                      }
                      break;
                  case '=':
                      if (key!=null)
                          break;
                      key = encoded
                          ?decodeString(content,mark+1,i-mark-1,charset)
                          :content.substring(mark+1,i);
                      mark=i;
                      encoded=false;
                      break;
                  case '+':
                      encoded=true;
                      break;
                  case '%':
                      encoded=true;
                      break;
                }                
            }
            
            if (key != null)
            {
                value =  encoded
                    ?decodeString(content,mark+1,content.length()-mark-1,charset)
                    :content.substring(mark+1);
                map.add(key,value);
            }
            else if (mark<content.length())
            {
                key = encoded
                    ?decodeString(content,mark+1,content.length()-mark-1,charset)
                    :content.substring(mark+1);
                map.add(key,"");
            }
        }
    }
    
    /* -------------------------------------------------------------- */
    /** Decoded parameters to Map.
     * @param data the byte[] containing the encoded parameters
     */
    public static void decodeTo(byte[] data, int offset, int length, MultiMap map, String charset)
    {
        if (data == null || length == 0)
            return;

        if (charset==null)
            charset=StringUtil.__ISO_8859_1;
        
        synchronized(map)
        {
            try
            {
                int    ix = offset;
                int    end = offset+length;
                int    ox = offset;
                String key = null;
                String value = null;
                while (ix < end)
                {
                    byte c = data[ix++];
                    switch ((char) c)
                    {
                      case '&':
                          value = new String(data, offset, ox, charset);
                          if (key != null)
                          {
                              map.add(key,value);
                              key = null;
                          }
                          ox = offset;
                          break;
                      case '=':
                          if (key!=null)
                              break;
                          key = new String(data, offset, ox, charset);
                          ox = offset;
                          break;
                      case '+':
                          data[ox++] = (byte)' ';
                          break;
                      case '%':
                          int i0 = (14<<4)+1;
                          byte b0 = (byte)i0;
                          data[ox++] = (byte)
                              ((TypeUtil.convertHexDigit(data[ix++]) << 4)+
                               TypeUtil.convertHexDigit(data[ix++]));
                          break;
                      default:
                          data[ox++] = c;
                    }
                }
                if (key != null)
                {
                    value = new String(data, offset, ox, charset);
                    map.add(key,value);
                }
            }
            catch(UnsupportedEncodingException e)
            {
                log.warn(LogSupport.EXCEPTION,e);
            }
        }
    }
    
    /* -------------------------------------------------------------- */
    /** Decode String with % encoding.
     * This method makes the assumption that the majority of calls
     * will need no decoding and uses the 8859 encoding.
     */
    public static String decodeString(String encoded)
    {
        return decodeString(encoded,0,encoded.length(),StringUtil.__ISO_8859_1);
    }
    
    /* -------------------------------------------------------------- */
    /** Decode String with % encoding.
     * This method makes the assumption that the majority of calls
     * will need no decoding.
     */
    public static String decodeString(String encoded,String charset)
    {
        return decodeString(encoded,0,encoded.length(),charset);
    }
    
            
    /* -------------------------------------------------------------- */
    /** Decode String with % encoding.
     * This method makes the assumption that the majority of calls
     * will need no decoding.
     */
    public static String decodeString(String encoded,int offset,int length,String charset)
    {
        if (charset==null)
            charset=StringUtil.__ISO_8859_1;
        byte[] bytes=null;
        int n=0;
        
        for (int i=0;i<length;i++)
        {
            char c = encoded.charAt(offset+i);
            if (c<0||c>0xff)
                throw new IllegalArgumentException("Not encoded");
            
            if (c=='+')
            {
                if (bytes==null)
                {
                    bytes=new byte[length*2];
                    encoded.getBytes(offset, offset+i, bytes, 0);
                    n=i;
                }
                bytes[n++] = (byte) ' ';
            }
            else if (c=='%' && (i+2)<length)
            {
                byte b;
                char cn = encoded.charAt(offset+i+1);
                if (cn>='a' && cn<='z')
                    b=(byte)(10+cn-'a');
                else if (cn>='A' && cn<='Z')
                    b=(byte)(10+cn-'A');
                else
                    b=(byte)(cn-'0');
                cn = encoded.charAt(offset+i+2);
                if (cn>='a' && cn<='z')
                    b=(byte)(b*16+10+cn-'a');
                else if (cn>='A' && cn<='Z')
                    b=(byte)(b*16+10+cn-'A');
                else
                    b=(byte)(b*16+cn-'0');

                if (bytes==null)
                {
                    bytes=new byte[length*2];
                    encoded.getBytes(offset, offset+i, bytes, 0);
                    n=i;
                }
                i+=2;
                bytes[n++]=b;
            }
            else if (n>0)
                bytes[n++] = (byte) c;
        }

        if (bytes==null)
        {
            if (offset==0 && encoded.length()==length)
                return encoded;
            return encoded.substring(offset,offset+length);
        }
        
        try
        {
            return new String(bytes,0,n,charset);
        }
        catch (UnsupportedEncodingException e)
        {
            return new String(bytes,0,n);
        }
        
    }
    
    /* ------------------------------------------------------------ */
    /** Perform URL encoding.
     * Assumes 8859 charset
     * @param string 
     * @return encoded string.
     */
    public static String encodeString(String string)
    {
        return encodeString(string,StringUtil.__ISO_8859_1);
    }
    
    /* ------------------------------------------------------------ */
    /** Perform URL encoding.
     * @param string 
     * @return encoded string.
     */
    public static String encodeString(String string,String charset)
    {
        if (charset==null)
            charset=StringUtil.__ISO_8859_1;
        byte[] bytes=null;
        try
        {
            bytes=string.getBytes(charset);
        }
        catch(UnsupportedEncodingException e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            bytes=string.getBytes();
        }
        
        int len=bytes.length;
        byte[] encoded= new byte[bytes.length*3];
        int n=0;
        boolean noEncode=true;
        
        for (int i=0;i<len;i++)
        {
            byte b = bytes[i];
            
            if (b==' ')
            {
                noEncode=false;
                encoded[n++]=(byte)'+';
            }
            else if (b>='a' && b<='z' ||
                     b>='A' && b<='Z' ||
                     b>='0' && b<='9')
            {
                encoded[n++]=b;
            }
            else
            {
                noEncode=false;
                encoded[n++]=(byte)'%';
                byte nibble= (byte) ((b&0xf0)>>4);
                if (nibble>=10)
                    encoded[n++]=(byte)('A'+nibble-10);
                else
                    encoded[n++]=(byte)('0'+nibble);
                nibble= (byte) (b&0xf);
                if (nibble>=10)
                    encoded[n++]=(byte)('A'+nibble-10);
                else
                    encoded[n++]=(byte)('0'+nibble);
            }
        }

        if (noEncode)
            return string;
        
        try
        {    
            return new String(encoded,0,n,charset);
        }
        catch(UnsupportedEncodingException e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            return new String(encoded,0,n);
        }
    }


    /* ------------------------------------------------------------ */
    /** 
     */
    public Object clone()
    {
	return super.clone();
    }
}
