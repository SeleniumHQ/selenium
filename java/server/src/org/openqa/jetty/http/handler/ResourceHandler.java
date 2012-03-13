// ========================================================================
// $Id: ResourceHandler.java,v 1.66 2005/08/24 08:18:17 gregwilkins Exp $
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

package org.openqa.jetty.http.handler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.List;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.http.InclusiveByteRange;
import org.openqa.jetty.http.MultiPartResponse;
import org.openqa.jetty.http.ResourceCache;
import org.openqa.jetty.util.CachedResource;
import org.openqa.jetty.util.IO;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.Resource;
import org.openqa.jetty.util.StringMap;
import org.openqa.jetty.util.TypeUtil;
import org.openqa.jetty.util.URI;

/* ------------------------------------------------------------ */
/** RestishHandler to serve files and resources.
 * Serves files from a given resource URL base and implements
 * the GET, HEAD, DELETE, OPTIONS, PUT, MOVE methods and the
 * IfModifiedSince and IfUnmodifiedSince header fields.
 * A simple memory cache is also provided to reduce file I/O.
 * HTTP/1.1 ranges are supported.
 * 
 * @version $Id: ResourceHandler.java,v 1.66 2005/08/24 08:18:17 gregwilkins Exp $
 * @author Nuno Preguiça
 * @author Greg Wilkins
 */
public class ResourceHandler extends AbstractHttpHandler
{
    private static Log log = LogFactory.getLog(ResourceHandler.class);

    /* ----------------------------------------------------------------- */
    private boolean _acceptRanges=true;
    private boolean _redirectWelcomeFiles ;
    private String[] _methods=null;
    private String _allowed;
    private boolean _dirAllowed=true;
    private int _minGzipLength =-1;
    private StringMap _methodMap = new StringMap();
    {
        setAllowedMethods(new String[]
            {
                HttpRequest.__GET,
                HttpRequest.__POST,
                HttpRequest.__HEAD,
                HttpRequest.__OPTIONS,
                HttpRequest.__TRACE
            });
    }

    /* ----------------------------------------------------------------- */
    /** Construct a ResourceHandler.
     */
    public ResourceHandler()
    {}

 
    /* ----------------------------------------------------------------- */
    public synchronized void start()
        throws Exception
    {        
        super.start();
    }
 
    /* ----------------------------------------------------------------- */
    public void stop()
        throws InterruptedException
    {
        super.stop();
    }

    /* ------------------------------------------------------------ */
    public String[] getAllowedMethods()
    {
        return _methods;
    }

    /* ------------------------------------------------------------ */
    public void setAllowedMethods(String[] methods)
    {
        StringBuffer b = new StringBuffer();
        _methods=methods;
        _methodMap.clear();
        for (int i=0;i<methods.length;i++)
        {
            _methodMap.put(methods[i],methods[i]);
            if (i>0)
                b.append(',');
            b.append(methods[i]);
        }
        _allowed=b.toString();
    }

    /* ------------------------------------------------------------ */
    public boolean isMethodAllowed(String method)
    {
        return _methodMap.get(method)!=null;
    }

    /* ------------------------------------------------------------ */
    public String getAllowedString()
    {
        return _allowed;
    }
    
    /* ------------------------------------------------------------ */
    public boolean isDirAllowed()
    {
        return _dirAllowed;
    }
    
    /* ------------------------------------------------------------ */
    public void setDirAllowed(boolean dirAllowed)
    {
        _dirAllowed = dirAllowed;
    }
    
    /* ------------------------------------------------------------ */
    public boolean isAcceptRanges()
    {
        return _acceptRanges;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @return True if welcome files are redirected to. False if forward is used.
     */
    public boolean getRedirectWelcome()
    {
        return _redirectWelcomeFiles;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @param redirectWelcome True if welcome files are redirected to. False
     * if forward is used. 
     */
    public void setRedirectWelcome(boolean redirectWelcome)
    {
        _redirectWelcomeFiles = redirectWelcome;
    }
    
    /* ------------------------------------------------------------ */
    /** Set if the handler accepts range requests.
     * Default is false;
     * @param ar True if the handler should accept ranges
     */
    public void setAcceptRanges(boolean ar)
    {
        _acceptRanges=ar;
    }
    
    /* ------------------------------------------------------------ */
    /** Get minimum content length for GZIP encoding.
     * @return Minimum length of content for gzip encoding or -1 if disabled.
     */
    public int getMinGzipLength()
    {
        return _minGzipLength;
    }
    
    /* ------------------------------------------------------------ */
    /** Set minimum content length for GZIP encoding.
     * @param minGzipLength If set to a positive integer, then static content
     * larger than this will be served as gzip content encoded
     * if a matching resource is found ending with ".gz"
     */
    public void setMinGzipLength(int minGzipLength)
    {
        _minGzipLength = minGzipLength;
    }

    
    /* ------------------------------------------------------------ */
    /** get Resource to serve.
     * Map a path to a resource. The default implementation calls
     * HttpContext.getResource but derived handers may provide
     * their own mapping.
     * @param pathInContext The path to find a resource for.
     * @return The resource to serve.
     */
    protected Resource getResource(String pathInContext)
        throws IOException
    {
        return getHttpContext().getResource(pathInContext);
    }
    
    /* ------------------------------------------------------------ */
    public void handle(String pathInContext,
                       String pathParams,
                       HttpRequest request,
                       HttpResponse response)
        throws HttpException, IOException
    {
        Resource resource = getResource(pathInContext);
        if (resource==null)
            return;

        // Is the method allowed?
        if (!isMethodAllowed(request.getMethod()))
        {
            if(log.isDebugEnabled())log.debug("Method not allowed: "+request.getMethod());
            if (resource.exists())
            {
                setAllowHeader(response);
                response.sendError(HttpResponse.__405_Method_Not_Allowed);
            }
            return;
        }

        // Handle the request
        try
        {
            if(log.isDebugEnabled())log.debug("PATH="+pathInContext+" RESOURCE="+resource);
            
            // check filename
            String method=request.getMethod();
            if (method.equals(HttpRequest.__GET) ||
                method.equals(HttpRequest.__POST) ||
                method.equals(HttpRequest.__HEAD))
                handleGet(request, response, pathInContext, pathParams, resource);  
            else if (method.equals(HttpRequest.__PUT))
                handlePut(request, response, pathInContext, resource);
            else if (method.equals(HttpRequest.__DELETE))
                handleDelete(request, response, pathInContext, resource);
            else if (method.equals(HttpRequest.__OPTIONS))
                handleOptions(response, pathInContext);
            else if (method.equals(HttpRequest.__MOVE))
                handleMove(request, response, pathInContext, resource);
            else if (method.equals(HttpRequest.__TRACE))
                handleTrace(request, response);
            else
            {
                if(log.isDebugEnabled())log.debug("Unknown action:"+method);
                // anything else...
                try{
                    if (resource.exists())
                        response.sendError(HttpResponse.__501_Not_Implemented);
                }
                catch(Exception e) {LogSupport.ignore(log,e);}
            }
        }
        catch(IllegalArgumentException e)
        {
            LogSupport.ignore(log,e);
        }
        finally
        {
            if (resource!=null && !(resource instanceof CachedResource))
                resource.release();
        }
    }

    /* ------------------------------------------------------------------- */
    public void handleGet(HttpRequest request,
                          HttpResponse response,
                          String pathInContext,
                          String pathParams,
                          Resource resource)
        throws IOException
    {
        if(log.isDebugEnabled())log.debug("Looking for "+resource);
        
        if (resource!=null && resource.exists())
        {            
            // check if directory
            if (resource.isDirectory())
            {
                if (!pathInContext.endsWith("/") && !pathInContext.equals("/"))
                {
                    log.debug("Redirect to directory/");
                    
                    String q=request.getQuery();
                    StringBuffer buf=request.getRequestURL();
                    if (q!=null&&q.length()!=0)
                    {
                        buf.append('?');
                        buf.append(q);
                    }
                    response.setField(HttpFields.__Location, URI.addPaths(buf.toString(),"/"));
                    response.setStatus(302);
                    request.setHandled(true);
                    return;
                }
  
                // See if index file exists
                String welcome=getHttpContext().getWelcomeFile(resource);
                if (welcome!=null)
                {     
                    // Forward to the index
                    String ipath=URI.addPaths(pathInContext,welcome);
                    if (_redirectWelcomeFiles)
                    {
                        // Redirect to the index
                        ipath=URI.addPaths(getHttpContext().getContextPath(),ipath);
                        response.setContentLength(0);
                        response.sendRedirect(ipath);
                    }
                    else
                    {
                        URI uri=request.getURI();
                        uri.setPath(URI.addPaths(uri.getPath(),welcome));
                        getHttpContext().handle(ipath,pathParams,request,response);
                    }
                    return;
                }

                // Check modified dates
                if (!passConditionalHeaders(request,response,resource))
                    return;
                // If we got here, no forward to index took place
                sendDirectory(request,response,resource,pathInContext.length()>1);
            }
            // check if it is a file
            else if (resource.exists())
            {
                // Check modified dates
                if (!passConditionalHeaders(request,response,resource))
                    return;
                sendData(request,response,pathInContext,resource,true);
            }
            else
                // don't know what it is
                log.warn("Unknown file type");
        }
    }

 
    /* ------------------------------------------------------------ */
    /* Check modification date headers.
     */
    private boolean passConditionalHeaders(HttpRequest request,
                                           HttpResponse response,
                                           Resource resource)
        throws IOException
    {
        if (!request.getMethod().equals(HttpRequest.__HEAD))
        {
            // If we have meta data for the file
            // Try a direct match for most common requests. Avoids
            // parsing the date.
            ResourceCache.ResourceMetaData metaData =
                (ResourceCache.ResourceMetaData)resource.getAssociate();
            if (metaData!=null)
            {
                String ifms=request.getField(HttpFields.__IfModifiedSince);
                String mdlm=metaData.getLastModified();
                if (ifms!=null && mdlm!=null && ifms.equals(mdlm))
                {
                    response.setStatus(HttpResponse.__304_Not_Modified);
                    request.setHandled(true);
                    return false;
                }
            }

            
            long date=0;
            // Parse the if[un]modified dates and compare to resource
            
            if ((date=request.getDateField(HttpFields.__IfUnmodifiedSince))>0)
            {
                if (resource.lastModified()/1000 > date/1000)
                {
                    response.sendError(HttpResponse.__412_Precondition_Failed);
                    return false;
                }
            }
            
            if ((date=request.getDateField(HttpFields.__IfModifiedSince))>0)
            {
                
                if (resource.lastModified()/1000 <= date/1000)
                {
                    response.setStatus(HttpResponse.__304_Not_Modified);
                    request.setHandled(true);
                    return false;
                }
            }
   
        }
        return true;
    }
 
 
    /* ------------------------------------------------------------ */
    void handlePut(HttpRequest request,
                   HttpResponse response,
                   String pathInContext,
                   Resource resource)
        throws IOException
    {
        if(log.isDebugEnabled())log.debug("PUT "+pathInContext+" in "+resource);

        boolean exists=resource!=null && resource.exists();
        if (exists &&
            !passConditionalHeaders(request,response,resource))
            return;
        
        if (pathInContext.endsWith("/"))
        {
            if (!exists)
            {
                if (!resource.getFile().mkdirs())
                    response.sendError(HttpResponse.__403_Forbidden, "Directories could not be created");
                else
                {
                    request.setHandled(true);
                    response.setStatus(HttpResponse.__201_Created);
                    response.commit();
                }
            }
            else
            {
                request.setHandled(true);
                response.setStatus(HttpResponse.__200_OK);
                response.commit();
            }
        }
        else
        {
            try
            {
                int toRead = request.getContentLength();
                InputStream in = request.getInputStream();
                OutputStream out = resource.getOutputStream();
                if (toRead>=0)
                    IO.copy(in,out,toRead);
                else
                    IO.copy(in,out);
                out.close();
                request.setHandled(true);
                response.setStatus(exists
                                   ?HttpResponse.__200_OK
                                   :HttpResponse.__201_Created);
                response.commit();
            }
            catch (Exception ex)
            {
                log.warn(LogSupport.EXCEPTION,ex);
                response.sendError(HttpResponse.__403_Forbidden,
                                   ex.getMessage());
            }
        }
    }

    /* ------------------------------------------------------------ */
    void handleDelete(HttpRequest request,
                      HttpResponse response,
                      String pathInContext,
                      Resource resource)
        throws IOException
    {
        if(log.isDebugEnabled())log.debug("DELETE "+pathInContext+" from "+resource);  
 
        if (!resource.exists() ||
            !passConditionalHeaders(request,response,resource))
            return;
 
        try
        {
            // delete the file
            if (resource.delete())
                response.setStatus(HttpResponse.__204_No_Content);
            else
                response.sendError(HttpResponse.__403_Forbidden);

            // Send response
            request.setHandled(true);
        }
        catch (SecurityException sex)
        {
            log.warn(LogSupport.EXCEPTION,sex);
            response.sendError(HttpResponse.__403_Forbidden, sex.getMessage());
        }
    }

 
    /* ------------------------------------------------------------ */
    void handleMove(HttpRequest request,
                    HttpResponse response,
                    String pathInContext,
                    Resource resource)
        throws IOException
    {
        if (!resource.exists() || !passConditionalHeaders(request,response,resource))
            return;

 
        String newPath = URI.canonicalPath(request.getField("New-uri"));
        if (newPath==null)
        {
            response.sendError(HttpResponse.__405_Method_Not_Allowed,
                               "Bad new uri");
            return;
        }

        String contextPath = getHttpContext().getContextPath();
        if (contextPath!=null && !newPath.startsWith(contextPath))
        {
            response.sendError(HttpResponse.__405_Method_Not_Allowed,
                               "Not in context");
            return;
        }
        

        // Find path
        try
        {
            // TODO - Check this
            String newInfo=newPath;
            if (contextPath!=null)
                newInfo=newInfo.substring(contextPath.length());
            Resource newFile = getHttpContext().getBaseResource().addPath(newInfo);
     
            if(log.isDebugEnabled())log.debug("Moving "+resource+" to "+newFile);
            resource.renameTo(newFile);
    
            response.setStatus(HttpResponse.__204_No_Content);
            request.setHandled(true);
        }
        catch (Exception ex)
        {
            log.warn(LogSupport.EXCEPTION,ex);
            setAllowHeader(response);
            response.sendError(HttpResponse.__405_Method_Not_Allowed,
                               "Error:"+ex);
            return;
        }
    }
 
    /* ------------------------------------------------------------ */
    void handleOptions(HttpResponse response, String pathInContext)
        throws IOException
    {
        if ("*".equals(pathInContext))
            return;
        setAllowHeader(response);
        response.commit();
    }
 
    /* ------------------------------------------------------------ */
    void setAllowHeader(HttpResponse response)
    {
        response.setField(HttpFields.__Allow, getAllowedString());
    }
    
    /* ------------------------------------------------------------ */
    public void writeHeaders(HttpResponse response,Resource resource, long count)
        throws IOException
    {
        ResourceCache.ResourceMetaData metaData =
            (ResourceCache.ResourceMetaData)resource.getAssociate();

        response.setContentType(metaData.getMimeType());
        if (count != -1)
        {
            if (count==resource.length())
                response.setField(HttpFields.__ContentLength,metaData.getLength());
            else
                response.setContentLength((int)count);
        }

        response.setField(HttpFields.__LastModified,metaData.getLastModified());
        
        if (_acceptRanges && response.getHttpRequest().getDotVersion()>0)
            response.setField(HttpFields.__AcceptRanges,"bytes");
    }

    /* ------------------------------------------------------------ */
    public void sendData(HttpRequest request,
                         HttpResponse response,
                         String pathInContext,
                         Resource resource,
                         boolean writeHeaders)
        throws IOException
    {
        long resLength=resource.length();
        
        //  see if there are any range headers
        Enumeration reqRanges =
            request.getDotVersion()>0
            ?request.getFieldValues(HttpFields.__Range)
            :null;
        
        if (!writeHeaders || reqRanges == null || !reqRanges.hasMoreElements())
        {
            // look for a gziped content.
            Resource data=resource;
            if (_minGzipLength>0)
            {
                String accept=request.getField(HttpFields.__AcceptEncoding);
                if (accept!=null && resLength>_minGzipLength &&
                    !pathInContext.endsWith(".gz"))
                {
                    Resource gz = getHttpContext().getResource(pathInContext+".gz");
                    if (gz.exists() && accept.indexOf("gzip")>=0)
                    {
                        if(log.isDebugEnabled())log.debug("gzip="+gz);
                        response.setField(HttpFields.__ContentEncoding,"gzip");
                        data=gz;
                        resLength=data.length();
                    }
                }
            }
            writeHeaders(response,resource,resLength);
            
            request.setHandled(true);
            OutputStream out = response.getOutputStream();
            data.writeTo(out,0,resLength);
            return;
        }
            
        // Parse the satisfiable ranges
        List ranges =InclusiveByteRange.satisfiableRanges(reqRanges,resLength);
        if(log.isDebugEnabled())log.debug("ranges: " + reqRanges + " == " + ranges);
        
        //  if there are no satisfiable ranges, send 416 response
        if (ranges==null || ranges.size()==0)
        {
            log.debug("no satisfiable ranges");
            writeHeaders(response, resource, resLength);
            response.setStatus(HttpResponse.__416_Requested_Range_Not_Satisfiable);
            response.setReason((String)HttpResponse.__statusMsg
                               .get(TypeUtil.newInteger(HttpResponse.__416_Requested_Range_Not_Satisfiable)));

            response.setField(HttpFields.__ContentRange, 
                              InclusiveByteRange.to416HeaderRangeString(resLength));
            
            OutputStream out = response.getOutputStream();
            resource.writeTo(out,0,resLength);
            request.setHandled(true);
            return;
        }

        
        //  if there is only a single valid range (must be satisfiable 
        //  since were here now), send that range with a 216 response
        if ( ranges.size()== 1)
        {
            InclusiveByteRange singleSatisfiableRange =
                (InclusiveByteRange)ranges.get(0);
            if(log.isDebugEnabled())log.debug("single satisfiable range: " + singleSatisfiableRange);
            long singleLength = singleSatisfiableRange.getSize(resLength);
            writeHeaders(response,resource,singleLength);
            response.setStatus(HttpResponse.__206_Partial_Content);
            response.setReason((String)HttpResponse.__statusMsg
                               .get(TypeUtil.newInteger(HttpResponse.__206_Partial_Content)));
            response.setField(HttpFields.__ContentRange, 
                              singleSatisfiableRange.toHeaderRangeString(resLength));
            OutputStream out = response.getOutputStream();
            resource.writeTo(out,
                             singleSatisfiableRange.getFirst(resLength), 
                             singleLength);
            request.setHandled(true);
            return;
        }

        
        //  multiple non-overlapping valid ranges cause a multipart
        //  216 response which does not require an overall 
        //  content-length header
        //
        ResourceCache.ResourceMetaData metaData =
            (ResourceCache.ResourceMetaData)resource.getAssociate();
        String encoding = metaData.getMimeType();
        MultiPartResponse multi = new MultiPartResponse(response);
        response.setStatus(HttpResponse.__206_Partial_Content);
        response.setReason((String)HttpResponse.__statusMsg
                           .get(TypeUtil.newInteger(HttpResponse.__206_Partial_Content)));

	// If the request has a "Request-Range" header then we need to
	// send an old style multipart/x-byteranges Content-Type. This
	// keeps Netscape and acrobat happy. This is what Apache does.
	String ctp;
	if (request.containsField(HttpFields.__RequestRange))
	    ctp = "multipart/x-byteranges; boundary=";
	else
	    ctp = "multipart/byteranges; boundary=";
	response.setContentType(ctp+multi.getBoundary());

        InputStream in=(resource instanceof CachedResource)
            ?null:resource.getInputStream();
        OutputStream out = response.getOutputStream();
        long pos=0;
            
        for (int i=0;i<ranges.size();i++)
        {
            InclusiveByteRange ibr = (InclusiveByteRange) ranges.get(i);
            String header=HttpFields.__ContentRange+": "+
                ibr.toHeaderRangeString(resLength);
            if(log.isDebugEnabled())log.debug("multi range: "+encoding+" "+header);
            multi.startPart(encoding,new String[]{header});

            long start=ibr.getFirst(resLength);
            long size=ibr.getSize(resLength);
            if (in!=null)
            {
                // Handle non cached resource
                if (start<pos)
                {
                    in.close();
                    in=resource.getInputStream();
                    pos=0;
                }
                if (pos<start)
                {
                    in.skip(start-pos);
                    pos=start;
                }
                IO.copy(in,out,size);
                pos+=size;
            }
            else
                // Handle cached resource
                resource.writeTo(out,start,size);
            
        }
        if (in!=null)
            in.close();
        multi.close();

        request.setHandled(true);

        return;
    }


    /* ------------------------------------------------------------------- */
    void sendDirectory(HttpRequest request,
                       HttpResponse response,
                       Resource resource,
                       boolean parent)
        throws IOException
    {
        if (!_dirAllowed)
        {
            response.sendError(HttpResponse.__403_Forbidden);
            return;
        }
        
        request.setHandled(true);
        
        if(log.isDebugEnabled())log.debug("sendDirectory: "+resource);
        byte[] data=null;
        if (resource instanceof CachedResource)
            data=((CachedResource)resource).getCachedData();
        
        if (data==null)
        {
            String base = URI.addPaths(request.getPath(),"/");
            String dir = resource.getListHTML(URI.encodePath(base),parent);
            if (dir==null)
            {
                response.sendError(HttpResponse.__403_Forbidden,
                                   "No directory");
                return;
            }
            data=dir.getBytes("UTF8");
            if (resource instanceof CachedResource)
                ((CachedResource)resource).setCachedData(data);
        }
        
        response.setContentType("text/html; charset=UTF8");
        response.setContentLength(data.length);
        
        if (request.getMethod().equals(HttpRequest.__HEAD))
        {
            response.commit();
            return;
        }
        
        response.getOutputStream().write(data,0,data.length);
        response.commit();
    }
}



