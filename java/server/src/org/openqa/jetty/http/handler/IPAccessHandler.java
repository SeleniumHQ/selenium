// ========================================================================
// Author : Gosta Jonasson
// Copyright (c) 2002 Gösta Jonasson gosta@kth.se. All rights reserved.
// Permission to use, copy, modify and distribute this software
// for non-commercial or commercial purposes and without fee is
// hereby granted provided that this copyright notice appears in
// all copies.
// ========================================================================

package org.openqa.jetty.http.handler;

import java.io.IOException;
import java.util.Hashtable;

import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;

/**
 * RestishHandler to authenticate access from certain IP-addresses. <br>
 * <br>
 * A server configuration-XML-file can look something like this: <br>
 * &lt;Configure class="org.openqa.jetty.jetty.Server"&gt; <br>
 * ... <br>
 * &lt;Call name="addContext"&gt; <br>
 * ... <br>
 * &lt;Call name="addHandler"&gt; <br>
 * &lt;Arg&gt; <br>
 * &lt;New class="IPAccessHandler"&gt; <br>
 * &lt;Set name="Standard"&gt;deny&lt;/Set&gt; <br>
 * &lt;Set name="AllowIP"&gt;192.168.0.103&lt;/Set&gt; <br>
 * &lt;Set name="AllowIP"&gt;192.168.0.100&lt;/Set&gt; <br>
 * &lt;/New&gt; <br>
 * &lt;/Arg&gt; <br>
 * &lt;/Call&gt; <br>
 * ... <br>
 * <br>
 * This would deny access for everyone except the requests from the IPs 192.168.0.100 and
 * 192.168.0.103.
 * 
 * @version v0.1 2002/03/20
 * @author Gösta Jonasson <a href="mailto:gosta@kth.se">gosta@kth.se </a>
 */
public class IPAccessHandler extends AbstractHttpHandler
{

    /** The standard way to deal with not configured IPs (true=allowed) */
    boolean standard = false;

    /** Hashtable where the configured IPs are kept */
    Hashtable ips;

    /**
     * Constructor for the class
     */
    public IPAccessHandler()
    {
        super();
        ips = new Hashtable();
    }

    /**
     * Checks if the given ipstring (x.x.x.x) is authorized or not
     * 
     * @param ipstring The ip-address as a String
     * @return True if the IP is allowed access, otherwise false.
     */
    public boolean checkIP(String ipstring)
    {
        Boolean ipconstrain = (Boolean) ips.get(ipstring);
        if (ipconstrain != null)
        {
            return ipconstrain.booleanValue();
        }
        else
        {
            return standard;
        }
    }

    /**
     * Handles the incoming request
     * 
     * @param pathInContext
     * @param pathParams
     * @param request The incoming HTTP-request
     * @param response The outgoing HTTP-response
     */
    public void handle(String pathInContext, String pathParams, HttpRequest request,
            HttpResponse response) throws HttpException, IOException
    {

        // exempt error pages
        // TODO This probably should be more general?
        if (request.getAttribute("javax.servlet.error.status_code") != null) return;

        try
        {

            String ip = request.getRemoteAddr();
            boolean authorized = checkIP(ip);

            if (!authorized)
            {
                // The IP is NOT allowed
                response.sendError(HttpResponse.__403_Forbidden);
                request.setHandled(true);
                return;
            }
            else
            {
                // The IP is allowed
                return;
            }
        }
        catch (Exception ex)
        {
            System.out.println(ex);
            response.sendError(HttpResponse.__500_Internal_Server_Error);
            request.setHandled(true);
        }
    }

    /**
     * Allow the given ip-address access
     * 
     * @param ipstring The ip-address as a String on the format "x.x.x.x"
     */
    public void setAllowIP(String ipstring)
    {
        ips.put(ipstring, Boolean.TRUE);
    }

    /**
     * Deny the given ip-address access
     * 
     * @param ipstring The ip-address as a String on the format "x.x.x.x"
     */
    public void setDenyIP(String ipstring)
    {
        ips.put(ipstring, Boolean.FALSE);
    }

    /**
     * Set the standard action beeing taken when not registred IPs wants access
     * 
     * @param s The standard-string (either 'allow' or 'deny')
     */
    public void setStandard(String s)
    {
        s = s.toLowerCase();
        if (s.indexOf("allow") > -1)
        {
            standard = true;
        }
        else
        {
            standard = false;
        }
    }

    /**
     * Main method for testing & debugging.
     *  
     */
    private static void main(String[] args)
    {
        IPAccessHandler ipah = new IPAccessHandler();
        ipah.setStandard("deny");
        ipah.setAllowIP("217.215.71.167");
        ipah.setDenyIP("217.215.71.149");
        System.out.println(ipah.checkIP("217.215.71.245") + " = false");
        System.out.println(ipah.checkIP("217.215.71.167") + " = true");
        System.out.println(ipah.checkIP("217.215.71.149") + " = false");
        System.out.println(ipah.checkIP("0.0.0.0") + " = false");

        IPAccessHandler ipah2 = new IPAccessHandler();
        ipah2.setStandard("allow");
        ipah2.setAllowIP("217.215.71.167");
        ipah2.setDenyIP("217.215.71.149");
        System.out.println(ipah2.checkIP("217.215.71.245") + " = true");
        System.out.println(ipah2.checkIP("217.215.71.167") + " = true");
        System.out.println(ipah2.checkIP("217.215.71.149") + " = false");
        System.out.println(ipah2.checkIP("0.0.0.0") + " = true");
    }
}
