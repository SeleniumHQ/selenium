// ========================================================================
// A very basic CGI Servlet, for use, with Jetty
// (jetty.mortbay.org). It's heading towards CGI/1.1 compliance, but
// still lacks a few features - the basic stuff is here though...
// Copyright 2000 Julian Gosnell <jules_gosnell@yahoo.com> Released
// under the terms of the Jetty Licence.
// ========================================================================

// TODO
// - logging
// - child's stderr
// - exceptions should report to client via sendError()
// - tidy up

package org.openqa.jetty.servlet;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.IO;
import org.openqa.jetty.util.LineInput;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.StringUtil;

//-----------------------------------------------------------------------------
/** CGI Servlet.
 *
 * The cgi bin directory can be set with the cgibinResourceBase init
 * parameter or it will default to the resource base of the context.
 *
 * The "commandPrefix" init parameter may be used to set a prefix to all
 * commands passed to exec. This can be used on systems that need assistance
 * to execute a particular file type. For example on windows this can be set
 * to "perl" so that perl scripts are executed.
 *
 * The "Path" init param is passed to the exec environment as PATH.
 * Note: Must be run unpacked somewhere in the filesystem.
 *
 * Any initParameter that starts with ENV_ is used to set an environment
 * variable with the name stripped of the leading ENV_ and using the init
 * parameter value.
 *
 * @version $Revision: 1.27 $
 * @author Julian Gosnell
 */
public class CGI extends HttpServlet
{
    private static Log log = LogFactory.getLog(CGI.class);

    protected File _docRoot;
    protected String _path;
    protected String _cmdPrefix;
    protected EnvList _env;

    /* ------------------------------------------------------------ */
    public void init()
        throws ServletException
    {
        _env= new EnvList();
        _cmdPrefix=getInitParameter("commandPrefix");

        String tmp = getInitParameter("cgibinResourceBase");
        if (tmp==null)
            tmp = getServletContext().getRealPath("/");

        if(log.isDebugEnabled())log.debug("CGI: CGI bin "+tmp);

        if (tmp==null)
        {
            log.warn("CGI: no CGI bin !");
            throw new ServletException();
        }

        File dir = new File(tmp);
        if (!dir.exists())
        {
            log.warn("CGI: CGI bin does not exist - "+dir);
            throw new ServletException();
        }

        if (!dir.canRead())
        {
            log.warn("CGI: CGI bin is not readable - "+dir);
            throw new ServletException();
        }

        if (!dir.isDirectory())
        {
            log.warn("CGI: CGI bin is not a directory - "+dir);
            throw new ServletException();
        }

        try
        {
            _docRoot=dir.getCanonicalFile();
            if(log.isDebugEnabled())log.debug("CGI: CGI bin accepted - "+_docRoot);
        }
        catch (IOException e)
        {
            log.warn("CGI: CGI bin failed - "+dir);
            e.printStackTrace();
            throw new ServletException();
        }

        _path=getInitParameter("Path");
        if(log.isDebugEnabled())log.debug("CGI: PATH accepted - "+_path);
        if (_path != null)
            _env.set("PATH", _path);

        Enumeration e= getInitParameterNames();
        while (e.hasMoreElements())
        {
            String n= (String)e.nextElement();
            if (n != null && n.startsWith("ENV_"))
                _env.set(n.substring(4),getInitParameter(n));
        }
    }

    /* ------------------------------------------------------------ */
    public void service(HttpServletRequest req, HttpServletResponse res)
        throws ServletException, IOException
    {
	String pathInContext =
	    StringUtil.nonNull(req.getServletPath()) +
	    StringUtil.nonNull(req.getPathInfo());

	if(log.isDebugEnabled())log.debug("CGI: req.getContextPath() : "+req.getContextPath());
        if(log.isDebugEnabled())log.debug("CGI: req.getServletPath() : "+req.getServletPath());
        if(log.isDebugEnabled())log.debug("CGI: req.getPathInfo()    : "+req.getPathInfo());
        if(log.isDebugEnabled())log.debug("CGI: _docRoot             : "+_docRoot);


        // pathInContext may actually comprises scriptName/pathInfo...We will
        // walk backwards up it until we find the script - the rest must
        // be the pathInfo;

        String both=pathInContext;
        String first=both;
        String last="";

        File exe=new File(_docRoot, first);

        while ((first.endsWith("/") || !exe.exists()) && first.length()>=0)
        {
            int index=first.lastIndexOf('/');

            first=first.substring(0, index);
            last=both.substring(index, both.length());
            exe=new File(_docRoot, first);
        }

        if (first.length()==0 ||
            !exe.exists() ||
            !exe.getCanonicalPath().equals(exe.getAbsolutePath()) ||
            exe.isDirectory())
            res.sendError(404);
        else
        {
            if(log.isDebugEnabled())log.debug("CGI: script is "+exe);
            if(log.isDebugEnabled())log.debug("CGI: pathInfo is "+last);

            exec(exe, last, req, res);
        }
    }

    /* ------------------------------------------------------------ */
    /*
     * @param root
     * @param path
     * @param req
     * @param res
     * @exception IOException
     */
    private void exec(File command,
                      String pathInfo,
                      HttpServletRequest req,
                      HttpServletResponse res)
        throws IOException
    {
        String path=command.toString();
        File dir=command.getParentFile();
        if(log.isDebugEnabled())log.debug("CGI: execing: "+path);

	EnvList env = new EnvList(_env);

	// these ones are from "The WWW Common Gateway Interface Version 1.1"
	// look at : http://Web.Golux.Com/coar/cgi/draft-coar-cgi-v11-03-clean.html#6.1.1
	env.set("AUTH_TYPE", req.getAuthType());
	env.set("CONTENT_LENGTH", Integer.toString(req.getContentLength()));
	env.set("CONTENT_TYPE", req.getContentType());
	env.set("GATEWAY_INTERFACE", "CGI/1.1");
	env.set("PATH_INFO", pathInfo);
	env.set("PATH_TRANSLATED", req.getPathTranslated());
	env.set("QUERY_STRING", req.getQueryString());
	env.set("REMOTE_ADDR", req.getRemoteAddr());
	env.set("REMOTE_HOST", req.getRemoteHost());
	// The identity information reported about the connection by a
	// RFC 1413 [11] request to the remote agent, if
	// available. Servers MAY choose not to support this feature, or
	// not to request the data for efficiency reasons.
	// "REMOTE_IDENT" => "NYI"
	env.set("REMOTE_USER", req.getRemoteUser());
	env.set("REQUEST_METHOD", req.getMethod());
    String scriptName = req.getRequestURI().substring(0,req.getRequestURI().length() - pathInfo.length());
	env.set("SCRIPT_NAME",scriptName);
    env.set("SCRIPT_FILENAME",getServletContext().getRealPath(scriptName));
    env.set("SERVER_NAME", req.getServerName());
	env.set("SERVER_PORT", Integer.toString(req.getServerPort()));
	env.set("SERVER_PROTOCOL", req.getProtocol());
        env.set("SERVER_SOFTWARE", getServletContext().getServerInfo());
	Enumeration enm = req.getHeaderNames();
	while (enm.hasMoreElements())
	{
	    String name = (String) enm.nextElement();
	    String value = req.getHeader(name);
	    env.set("HTTP_" + name.toUpperCase().replace( '-', '_' ), value);
	}

	// these extra ones were from printenv on www.dev.nomura.co.uk
	env.set("HTTPS", (req.isSecure()?"ON":"OFF"));
	// "DOCUMENT_ROOT" => root + "/docs",
	// "SERVER_URL" => "NYI - http://us0245",
	// "TZ" => System.getProperty("user.timezone"),

        // are we meant to decode args here ? or does the script get them
        // via PATH_INFO ?  if we are, they should be decoded and passed
        // into exec here...

        String execCmd=path;
        if (execCmd.indexOf(" ")>=0)
            execCmd="\""+execCmd+"\"";
        if (_cmdPrefix!=null)
            execCmd=_cmdPrefix+" "+execCmd;

        Process p=dir==null
            ?Runtime.getRuntime().exec(execCmd, env.getEnvArray())
            :Runtime.getRuntime().exec(execCmd, env.getEnvArray(),dir);

        // hook processes input to browser's output (async)
        final InputStream inFromReq=req.getInputStream();
        final OutputStream outToCgi=p.getOutputStream();
        final int inputLength = req.getContentLength();

        new Thread(new Runnable()  // Thread safety reviewed
            {
                public void run()
                {
                    try{
                        if (inputLength>0)
                            IO.copy(inFromReq,outToCgi,inputLength);
                        outToCgi.close();
                    }
                    catch(IOException e){LogSupport.ignore(log,e);}
                }
            }).start();


        // hook processes output to browser's input (sync)
        // if browser closes stream, we should detect it and kill process...
        try
        {
            // read any headers off the top of our input stream
            LineInput li = new LineInput(p.getInputStream());
            HttpFields fields=new HttpFields();
            fields.read(li);

            String ContentStatus = "Status";
            String redirect = fields.get(HttpFields.__Location);
            String status   = fields.get(ContentStatus);

            if (status!=null)
            {
                log.debug("Found a Status header - setting status on response");
                fields.remove(ContentStatus);

                // NOTE: we ignore any reason phrase, otherwise we
                // would need to use res.sendError() selectively.
                int i = status.indexOf(' ');
                if (i>0)
                    status = status.substring(0,i);

                res.setStatus(Integer.parseInt(status));
            }

            // copy remaining headers into response...
	    for (Iterator i=fields.iterator(); i.hasNext();)
            {
                HttpFields.Entry e=(HttpFields.Entry)i.next();
                res.addHeader(e.getKey(),e.getValue());
            }

            if (status==null && redirect != null)
            {
                // The CGI has set Location and is counting on us to do the redirect.
                // See http://CGI-Spec.Golux.Com/draft-coar-cgi-v11-03-clean.html#7.2.1.2
                if (!redirect.startsWith("http:/")&&!redirect.startsWith("https:/"))
                    res.sendRedirect(redirect);
                else
                    res.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
            }

            // copy remains of input onto output...
            IO.copy(li, res.getOutputStream());

	    p.waitFor();
	    int exitValue = p.exitValue();
	    if(log.isDebugEnabled())log.debug("CGI: p.exitValue(): " + exitValue);
	    if (0 != exitValue)
	    {
		log.warn("Non-zero exit status ("+exitValue+
			     ") from CGI program: "+path);
		if (!res.isCommitted())
		    res.sendError(500, "Failed to exec CGI");
	    }
        }
        catch (IOException e)
        {
            // browser has probably closed its input stream - we
            // terminate and clean up...
            log.debug("CGI: Client closed connection!");
        }
	catch (InterruptedException ie)
        {
            log.debug("CGI: interrupted!");
        }
	finally
	{
            p.destroy();
	}

	if(log.isDebugEnabled())log.debug("CGI: Finished exec: " + p);
    }


    /* ------------------------------------------------------------ */
    /** private utility class that manages the Environment passed
     * to exec.
     */
    private static class EnvList
    {
        private Map envMap;

        EnvList()
        {
            envMap= new HashMap();
        }

        EnvList(EnvList l)
        {
            envMap= new HashMap(l.envMap);
        }

	/** Set a name/value pair, null values will be treated as
	 * an empty String */
	public void set(String name, String value) {
            envMap.put(name, name + "=" + StringUtil.nonNull(value));
	}

	/** Get representation suitable for passing to exec. */
	public String[] getEnvArray()
	{
            return (String[])envMap.values().toArray(new String[envMap.size()]);
	}
    }
}
