// ========================================================================
// $Id: InetAddrPort.java,v 1.7 2004/10/23 09:03:22 gregwilkins Exp $
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

import java.io.Serializable;
import java.net.InetAddress;

/* ======================================================================== */
/** InetAddress and Port.
 */
public class InetAddrPort implements Serializable
{
    /* ------------------------------------------------------------ */
    public final static String __0_0_0_0 = "0.0.0.0";

    /* ------------------------------------------------------------ */
    private InetAddress _addr=null;
    private boolean _addrIsHost=false;
    private int _port=0;

    /* ------------------------------------------------------------------- */
    public InetAddrPort()
    {}

    /* ------------------------------------------------------------ */
    /** Constructor for a port on all local host address.
     * @param port 
     */
    public InetAddrPort(int port)
    {
        _port=port;
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param addr 
     * @param port 
     */
    public InetAddrPort(InetAddress addr, int port)
    {
        _addr=addr;
        _port=port;
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param host
     * @param port 
     */
    public InetAddrPort(String host, int port)
        throws java.net.UnknownHostException
    {
        setHost(host);
        setPort(port);
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param inetAddrPort String of the form "addr:port"
     */
    public InetAddrPort(String inetAddrPort)
        throws java.net.UnknownHostException
    {
        int c = inetAddrPort.indexOf(':');
        if (c>=0)
        {
            String addr=inetAddrPort.substring(0,c);
            if (addr.indexOf('/')>0)
                addr=addr.substring(addr.indexOf('/')+1);
            inetAddrPort=inetAddrPort.substring(c+1);
        
            if (addr.length()>0 && ! __0_0_0_0.equals(addr))
            {
                _addrIsHost=!Character.isDigit((addr.charAt(0)));   
                this._addr=InetAddress.getByName(addr);
            }
        }
        
        _port = Integer.parseInt(inetAddrPort); 
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param address InetAddrPort top copy.
     */
    public InetAddrPort(InetAddrPort address)
    {
        if (address!=null)
        {
            _addr=address._addr;
            _port=address._port;
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Get the Host.
     * @return The IP address
     */
    public String getHost()
    {
        if (_addr==null)
            return __0_0_0_0;
        
        return _addrIsHost?_addr.getHostName():_addr.getHostAddress();
    }
    
    /* ------------------------------------------------------------ */
    /** Set the Host.
     * @param host 
     * @exception java.net.UnknownHostException 
     */
    public void setHost(String host)
        throws java.net.UnknownHostException
    {
        _addr=null;
        if (host!=null)
        {
            if (host.indexOf('/')>0)
                host=host.substring(0,host.indexOf('/'));
            _addrIsHost=!Character.isDigit((host.charAt(0)));
            _addr=InetAddress.getByName(host);
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Get the IP address.
     * @return The IP address
     */
    public InetAddress getInetAddress()
    {
        return _addr;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the IP address.
     * @param addr The IP address
     */
    public void setInetAddress(InetAddress addr)
    {
        _addrIsHost=false;
        _addr=addr;
    }

    /* ------------------------------------------------------------ */
    /** Get the port.
     * @return The port number
     */
    public int getPort()
    {
        return _port;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the port.
     * @param port The port number
     */
    public void setPort(int port)
    {
        _port=port;
    }
    
    
    /* ------------------------------------------------------------------- */
    public String toString()
    {
        return getHost()+':'+_port;
    }

    /* ------------------------------------------------------------ */
    /** Clone the InetAddrPort.
     * @return A new instance.
     */
    public Object clone()
    {
        return new InetAddrPort(this);
    }

    /* ------------------------------------------------------------ */
    /** Hash Code.
     * @return hash Code.
     */
    public int hashCode()
    {
        return _port+((_addr==null)?0:_addr.hashCode());
    }
    
    /* ------------------------------------------------------------ */
    /** Equals.
     * @param o 
     * @return True if is the same address and port.
     */
    public boolean equals(Object o)
    {
        if (o==null)
            return false;
        if (o==this)
            return true;
        if (o instanceof InetAddrPort)
        {
            InetAddrPort addr=(InetAddrPort)o;
            return addr._port==_port &&
                ( addr._addr==_addr ||
                  addr._addr!=null && addr._addr.equals(_addr));
        }
        return false;
    }
}

    




