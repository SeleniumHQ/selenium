// CgiServlet - runs CGI programs
//
// Copyright (C)1996,1998 by Jef Poskanzer <jef@acme.com>. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
// OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
// OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// Visit the ACME Labs Java page for up-to-date versions of this and other

/*
Copyright (c) 2003 ThoughtWorks, Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

   3. The end-user documentation included with the redistribution, if any, must
      include the following acknowledgment:

          This product includes software developed by ThoughtWorks, Inc.
          (http://www.thoughtworks.com/).

      Alternately, this acknowledgment may appear in the software itself, if and
      wherever such third-party acknowledgments normally appear.

   4. The names "CruiseControl", "CruiseControl.NET", "CCNET", and
      "ThoughtWorks, Inc." must not be used to endorse or promote products derived
      from this software without prior written permission. For written permission,
      please contact opensource@thoughtworks.com.

   5. Products derived from this software may not be called "Selenium" or
      "ThoughtWorks", nor may "Selenium" or "ThoughtWorks" appear in their name,
      without prior written permission of ThoughtWorks, Inc.


THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THOUGHTWORKS
INC OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
*/
package Acme.Serve;

import java.io.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class CgiServlet extends HttpServlet
    {

    /// Returns a string containing information about the author, version, and
    // copyright of the servlet.
	public String getServletInfo() { 
		return "runs CGI programs";
	}

    /// Services a single request from the client.
    // @param req the servlet request
    // @param req the servlet response
    // @exception ServletException when an exception has occurred
	public void service( HttpServletRequest req, HttpServletResponse res ) throws ServletException, IOException	{
		if ( ! ( req.getMethod().equalsIgnoreCase( "get" ) ||
			req.getMethod().equalsIgnoreCase( "post" ) ) ) { 
			res.sendError( HttpServletResponse.SC_NOT_IMPLEMENTED );
			return;
		}
		dispatchPathname( req, res, 
						  getServletContext().getRealPath(req.getServletPath() + req.getPathInfo()));
	}


	private void dispatchPathname( HttpServletRequest req, HttpServletResponse res, String path ) throws IOException {
		if ( new File( path ).exists() )
			serveFile( req, res, path );
		else
			res.sendError( HttpServletResponse.SC_NOT_FOUND );
	}


    private void serveFile( HttpServletRequest req, HttpServletResponse res, String path ) throws IOException
	{
	String queryString = req.getQueryString();
	int contentLength = req.getContentLength();
	int c;

	log( "running " + path );

	// Make argument list.
	String argList[] = (path+(queryString != null && queryString.indexOf( "=" ) == -1?"+"+queryString:"")).split("+");

	// Make environment list.
	Vector envVec = new Vector();
	envVec.addElement( makeEnv(
	    "PATH", "/usr/local/bin:/usr/ucb:/bin:/usr/bin" ) );
	envVec.addElement( makeEnv( "GATEWAY_INTERFACE", "CGI/1.1" ) );
	envVec.addElement( makeEnv(
	    "SERVER_SOFTWARE", getServletContext().getServerInfo() ) );
	envVec.addElement( makeEnv( "SERVER_NAME", req.getServerName() ) );
	envVec.addElement( makeEnv(
	    "SERVER_PORT", Integer.toString( req.getServerPort() ) ) );
	envVec.addElement( makeEnv( "REMOTE_ADDR", req.getRemoteAddr() ) );
	envVec.addElement( makeEnv( "REMOTE_HOST", req.getRemoteHost() ) );
	envVec.addElement( makeEnv( "REQUEST_METHOD", req.getMethod() ) );
	if ( contentLength != -1 )
	    envVec.addElement( makeEnv(
		"CONTENT_LENGTH", Integer.toString( contentLength ) ) );
	if ( req.getContentType() != null )
	    envVec.addElement( makeEnv(
		"CONTENT_TYPE", req.getContentType() ) );
	envVec.addElement( makeEnv( "SCRIPT_NAME", req.getServletPath() ) );
	if ( req.getPathInfo() != null )
	    envVec.addElement( makeEnv( "PATH_INFO", req.getPathInfo() ) );
	if ( req.getPathTranslated() != null )
	    envVec.addElement( makeEnv(
		"PATH_TRANSLATED", req.getPathTranslated() ) );
	if ( queryString != null )
	    envVec.addElement( makeEnv( "QUERY_STRING", queryString ) );
	envVec.addElement( makeEnv( "SERVER_PROTOCOL", req.getProtocol() ) );
	if ( req.getRemoteUser() != null )
	    envVec.addElement( makeEnv( "REMOTE_USER", req.getRemoteUser() ) );
	if ( req.getAuthType() != null )
	    envVec.addElement( makeEnv( "AUTH_TYPE", req.getAuthType() ) );
	Enumeration hnEnum = req.getHeaderNames();
	while ( hnEnum.hasMoreElements() )
	    {
	    String name = (String) hnEnum.nextElement();
	    String value = req.getHeader( name );
	    if ( value == null )
		value = "";
	    envVec.addElement( makeEnv(
		"HTTP_" + name.toUpperCase().replace( '-', '_' ), value ) );
	    }
	String envList[] = makeList( envVec );

	// Start the command.
	Process proc = Runtime.getRuntime().exec( argList, envList );

	try
	    {
	    // If it's a POST, copy the request data to the process.
	    if ( req.getMethod().equalsIgnoreCase( "post" ) )
		{
		InputStream reqIn = req.getInputStream();
		OutputStream procOut = proc.getOutputStream();
		for ( int i = 0; i < contentLength; ++i )
		    {
		    c = reqIn.read();
		    if ( c == -1 )
			break;
		    procOut.write( c );
		    }
		procOut.close();
		}

	    // Now read the response from the process.
	    BufferedReader procIn = new BufferedReader( new InputStreamReader(
		proc.getInputStream() ) );
	    OutputStream resOut = res.getOutputStream();
	    // Some of the headers have to be intercepted and handled.
	    boolean firstLine = true;
	    while ( true )
		{
		String line = procIn.readLine();
		if ( line == null )
		    break;
		line = line.trim();
		if ( line.equals( "" ) )
		    break;
		int colon = line.indexOf( ":" );
		if ( colon == -1 )
		    {
		    // No colon.  If it's the first line, parse it for status.
		    if ( firstLine )
			{
			StringTokenizer tok = new StringTokenizer( line, " " );
			try
			    {
			    switch( tok.countTokens() )
				{
				case 2:
				tok.nextToken();
				res.setStatus(
				    Integer.parseInt( tok.nextToken() ) );
				break;
				case 3:
				tok.nextToken();
				res.setStatus(
				    Integer.parseInt( tok.nextToken() ),
				    tok.nextToken() );
				break;
				}
			    }
			catch ( NumberFormatException ignore ) {}
			}
		    else
			{
			// No colon and it's not the first line?  Ignore.
			}
		    }
		else
		    {
		    // There's a colon.  Check for certain special headers.
		    String name = line.substring( 0, colon );
		    String value = line.substring( colon + 1 ).trim();
		    if ( name.equalsIgnoreCase( "Status" ) )
			{
			StringTokenizer tok = new StringTokenizer( value, " " );
			try
			    {
			    switch( tok.countTokens() )
				{
				case 1:
				res.setStatus(
				    Integer.parseInt( tok.nextToken() ) );
				break;
				case 2:
				res.setStatus(
				    Integer.parseInt( tok.nextToken() ),
				    tok.nextToken() );
				break;
				}
			    }
			catch ( NumberFormatException ignore ) {}
			}
		    else if ( name.equalsIgnoreCase( "Content-type" ) )
			{
			res.setContentType( value );
			}
		    else if ( name.equalsIgnoreCase( "Content-length" ) )
			{
			try
			    {
			    res.setContentLength( Integer.parseInt( value ) );
			    }
			catch ( NumberFormatException ignore ) {}
			}
		    else if ( name.equalsIgnoreCase( "Location" ) )
			{
			res.setStatus(
			    HttpServletResponse.SC_MOVED_TEMPORARILY );
			res.setHeader( name, value );
			}
		    else
			{
			// Not a special header.  Just set it.
			res.setHeader( name, value );
			}
		    }
		}
	    // Copy the rest of the data uninterpreted.
	    Acme.Utils.copyStream( procIn, resOut );
	    procIn.close();
	    resOut.close();
	    }
	catch ( IOException e )
	    {
	    //res.sendError( HttpServletResponse.SC_INTERNAL_SERVER_ERROR );
	    // There's some weird bug in Java, when reading from a Process
	    // you get a spurious IOException.  We have to ignore it.
	    }
	}


    private static String makeEnv( String name, String value )
	{
	return name + "=" + value;
	}


    private static String[] makeList( Vector vec )
	{
	String list[] = new String[vec.size()];
	for ( int i = 0; i < vec.size(); ++i )
	    list[i] = (String) vec.elementAt( i );
	return list;
	}

    }
