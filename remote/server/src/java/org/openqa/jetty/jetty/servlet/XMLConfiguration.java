// ========================================================================
// $Id: XMLConfiguration.java,v 1.20 2005/12/05 08:56:48 gregwilkins Exp $
// Copyright 2003-2004 Mort Bay Consulting Pty. Ltd.
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
package org.openqa.jetty.jetty.servlet;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Enumeration;
import java.util.EventListener;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.UnavailableException;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.Authenticator;
import org.openqa.jetty.http.ClientCertAuthenticator;
import org.openqa.jetty.http.SecurityConstraint;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.Resource;
import org.openqa.jetty.xml.XmlParser;
/* ------------------------------------------------------------------------------- */
/**
 * @version $Revision: 1.20 $
 * @author gregw
 */
public class XMLConfiguration implements WebApplicationContext.Configuration
{
    private static Log log=LogFactory.getLog(XMLConfiguration.class);
    private WebApplicationContext _context;
    protected XmlParser xmlParser;

    public XMLConfiguration()
    {
        // Get parser
        xmlParser=webXmlParser();
    }
    
    public static XmlParser webXmlParser()
    {
        XmlParser xmlParser=new XmlParser();
        //set up cache of DTDs and schemas locally
        URL dtd22=WebApplicationContext.class.getResource("/javax/servlet/resources/web-app_2_2.dtd");
        URL dtd23=WebApplicationContext.class.getResource("/javax/servlet/resources/web-app_2_3.dtd");
        URL jsp20xsd=WebApplicationContext.class.getResource("/javax/servlet/resources/jsp_2_0.xsd");
        URL j2ee14xsd=WebApplicationContext.class.getResource("/javax/servlet/resources/j2ee_1_4.xsd");
        URL webapp24xsd=WebApplicationContext.class.getResource("/javax/servlet/resources/web-app_2_4.xsd");
        URL schemadtd=WebApplicationContext.class.getResource("/javax/servlet/resources/XMLSchema.dtd");
        URL xmlxsd=WebApplicationContext.class.getResource("/javax/servlet/resources/xml.xsd");
        URL webserviceclient11xsd=WebApplicationContext.class.getResource("/javax/servlet/resources/j2ee_web_services_client_1_1.xsd");
        URL webservice11xsd=WebApplicationContext.class.getResource("/javax/servlet/resources/j2ee_web_services_1_1.xsd");
        URL datatypesdtd=WebApplicationContext.class.getResource("/javax/servlet/resources/datatypes.dtd");
        xmlParser.redirectEntity("web-app_2_2.dtd",dtd22);
        xmlParser.redirectEntity("-//Sun Microsystems, Inc.//DTD Web Application 2.2//EN",dtd22);
        xmlParser.redirectEntity("web.dtd",dtd23);
        xmlParser.redirectEntity("web-app_2_3.dtd",dtd23);
        xmlParser.redirectEntity("-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN",dtd23);
        xmlParser.redirectEntity("XMLSchema.dtd",schemadtd);
        xmlParser.redirectEntity("http://www.w3.org/2001/XMLSchema.dtd",schemadtd);
        xmlParser.redirectEntity("-//W3C//DTD XMLSCHEMA 200102//EN",schemadtd);
        xmlParser.redirectEntity("jsp_2_0.xsd",jsp20xsd);
        xmlParser.redirectEntity("http://java.sun.com/xml/ns/j2ee/jsp_2_0.xsd",jsp20xsd);
        xmlParser.redirectEntity("j2ee_1_4.xsd",j2ee14xsd);
        xmlParser.redirectEntity("http://java.sun.com/xml/ns/j2ee/j2ee_1_4.xsd",j2ee14xsd);
        xmlParser.redirectEntity("web-app_2_4.xsd",webapp24xsd);
        xmlParser.redirectEntity("http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd",webapp24xsd);
        xmlParser.redirectEntity("xml.xsd",xmlxsd);
        xmlParser.redirectEntity("http://www.w3.org/2001/xml.xsd",xmlxsd);
        xmlParser.redirectEntity("datatypes.dtd",datatypesdtd);
        xmlParser.redirectEntity("http://www.w3.org/2001/datatypes.dtd",datatypesdtd);
        xmlParser.redirectEntity("j2ee_web_services_client_1_1.xsd",webservice11xsd);
        xmlParser.redirectEntity("http://www.ibm.com/webservices/xsd/j2ee_web_services_1_1.xsd",webservice11xsd);
        xmlParser.redirectEntity("http://www.ibm.com/webservices/xsd/j2ee_web_services_client_1_1.xsd",webserviceclient11xsd);
        return xmlParser;
    }
    
    
    public void setWebApplicationContext (WebApplicationContext context)
    {
        _context = context;
    }
   
    
    public WebApplicationContext getWebApplicationContext()
    {
        return _context;
    }

    public WebApplicationHandler getWebApplicationHandler()
    {
         return _context.getWebApplicationHandler();
    }
    
    /* ------------------------------------------------------------------------------- */
    /** Configure ClassPath.
     * This method is called before the context ClassLoader is created.  
     * Paths and libraries should be added to the context using the setClassPath,
     * addClassPath and addClassPaths methods.  The default implementation looks
     * for WEB-INF/classes, WEB-INF/lib/*.zip and WEB-INF/lib/*.jar
     * @throws Exception
     */
    public  void configureClassPath()
    throws Exception
    {
        //cannot configure if the context is already started
        if (_context.isStarted())
        {
            if (log.isDebugEnabled()){log.debug("Cannot configure webapp after it is started");};
            return;
        }
        
        Resource webInf=_context.getWebInf();
        
        // Add WEB-INF classes and lib classpaths
        if (webInf != null && webInf.isDirectory())
        {
            // Look for classes directory
            Resource classes= webInf.addPath("classes/");
            if (classes.exists())
                _context.setClassPath(classes.toString());
            else
                _context.setClassPath(null);
  
            // Look for jars
            Resource lib= webInf.addPath("lib/");
            _context.addClassPaths(lib);
        }
     }

    /* ------------------------------------------------------------------------------- */
    public void configureDefaults() throws Exception
    {
        //cannot configure if the context is already started
        if (_context.isStarted())
        {
            if (log.isDebugEnabled()){log.debug("Cannot configure webapp after it is started");};
            return;
        }
        
        getWebApplicationContext().setWelcomeFiles(null);
        
        String defaultsDescriptor=getWebApplicationContext().getDefaultsDescriptor();
        if(defaultsDescriptor!=null&&defaultsDescriptor.length()>0)
        {
            Resource dftResource=Resource.newSystemResource(defaultsDescriptor);
            if(dftResource==null)
                dftResource=Resource.newResource(defaultsDescriptor);
            XmlParser.Node defaultConfig=xmlParser.parse(dftResource.getURL());
            initialize(defaultConfig);
        }
    }

    /* ------------------------------------------------------------------------------- */
    public void configureWebApp() throws Exception
    {
        //cannot configure if the context is already started
        if (_context.isStarted())
        {
            if (log.isDebugEnabled()){log.debug("Cannot configure webapp after it is started");};
            return;
        }
        
        Resource webInf=getWebApplicationContext().getWebInf();
        // handle any WEB-INF descriptors
        if(webInf!=null&&webInf.isDirectory())
        {
            // do web.xml file
            Resource web=webInf.addPath("web.xml");
            if(!web.exists())
            {
                log.info("No WEB-INF/web.xml in "+getWebApplicationContext().getWAR()
                        +". Serving files and default/dynamic servlets only");
            }
            else
            {
                XmlParser.Node config=null;
                config=xmlParser.parse(web.getURL());
                initialize(config);
            }
        }
    }
     

    /* ------------------------------------------------------------ */
    protected void initialize(XmlParser.Node config) throws ClassNotFoundException,UnavailableException
    {
        Iterator iter=config.iterator();
        XmlParser.Node node=null;
        while(iter.hasNext())
        {
            try
            {
                Object o=iter.next();
                if(!(o instanceof XmlParser.Node))
                    continue;
                node=(XmlParser.Node)o;
                String name=node.getTag();
                initWebXmlElement(name,node);
            }
            catch(ClassNotFoundException e)
            {
                throw e;
            }
            catch(Exception e)
            {
                log.warn("Configuration problem at "+node,e);
                throw new UnavailableException("Configuration problem");
            }
        }
    }

    /* ------------------------------------------------------------ */
    /**
     * Handle web.xml element. This method is called for each top level element within the web.xml
     * file. It may be specialized by derived WebApplicationContexts to provide additional
     * configuration and handling.
     * 
     * @param element The element name
     * @param node The node containing the element.
     */
    protected void initWebXmlElement(String element,XmlParser.Node node) throws Exception
    {
        if("display-name".equals(element))
            initDisplayName(node);
        else if("description".equals(element))
        {}
        else if("context-param".equals(element))
            initContextParam(node);
        else if("servlet".equals(element))
            initServlet(node);
        else if("servlet-mapping".equals(element))
            initServletMapping(node);
        else if("session-config".equals(element))
            initSessionConfig(node);
        else if("mime-mapping".equals(element))
            initMimeConfig(node);
        else if("welcome-file-list".equals(element))
            initWelcomeFileList(node);
        else if("locale-encoding-mapping-list".equals(element))
            initLocaleEncodingList(node);
        else if("error-page".equals(element))
            initErrorPage(node);
        else if("taglib".equals(element))
            initTagLib(node);
        else if("jsp-config".equals(element))
            initJspConfig(node);
        else if("resource-ref".equals(element))
        {
            if(log.isDebugEnabled())
                log.debug("No implementation: "+node);
        }
        else if("security-constraint".equals(element))
            initSecurityConstraint(node);
        else if("login-config".equals(element))
            initLoginConfig(node);
        else if("security-role".equals(element))
            initSecurityRole(node);
        else if("filter".equals(element))
            initFilter(node);
        else if("filter-mapping".equals(element))
            initFilterMapping(node);
        else if("listener".equals(element))
            initListener(node);
        else if("distributable".equals(element))
            initDistributable(node);
        else
        {
            if(log.isDebugEnabled())
            {
                log.debug("Element "+element+" not handled in "+this);
                log.debug(node);
            }
        }
    }

    /* ------------------------------------------------------------ */
    protected void initDisplayName(XmlParser.Node node)
    {
        getWebApplicationContext().setDisplayName(node.toString(false,true));
    }

    /* ------------------------------------------------------------ */
    protected void initContextParam(XmlParser.Node node)
    {
        String name=node.getString("param-name",false,true);
        String value=node.getString("param-value",false,true);
        if(log.isDebugEnabled())
            log.debug("ContextParam: "+name+"="+value);
        getWebApplicationContext().setInitParameter(name,value);
    }

    /* ------------------------------------------------------------ */
    protected void initFilter(XmlParser.Node node) throws ClassNotFoundException,UnavailableException
    {
        String name=node.getString("filter-name",false,true);
        String className=node.getString("filter-class",false,true);
        if(className==null)
        {
            log.warn("Missing filter-class in "+node);
            return;
        }
        if(name==null)
            name=className;
        FilterHolder holder=getWebApplicationHandler().defineFilter(name,className);
        Iterator iter=node.iterator("init-param");
        while(iter.hasNext())
        {
            XmlParser.Node paramNode=(XmlParser.Node)iter.next();
            String pname=paramNode.getString("param-name",false,true);
            String pvalue=paramNode.getString("param-value",false,true);
            holder.put(pname,pvalue);
        }
    }

    /* ------------------------------------------------------------ */
    protected void initFilterMapping(XmlParser.Node node)
    {
        String filterName=node.getString("filter-name",false,true);
        String pathSpec=node.getString("url-pattern",false,true);
        String servletName=node.getString("servlet-name",false,true);
        int dispatcher=Dispatcher.__DEFAULT;
        Iterator iter=node.iterator("dispatcher");
        while(iter.hasNext())
        {
            String d=((XmlParser.Node)iter.next()).toString(false,true);
            dispatcher|=Dispatcher.type(d);
        }
            
        FilterHolder holder=(servletName!=null)
                ?getWebApplicationHandler().addFilterServletMapping(servletName, filterName, dispatcher)
                :getWebApplicationHandler().addFilterPathMapping(pathSpec, filterName, dispatcher);
    }

    /* ------------------------------------------------------------ */
    protected void initServlet(XmlParser.Node node) throws ClassNotFoundException,UnavailableException,IOException,
            MalformedURLException
    {
        String name=node.getString("servlet-name",false,true);
        String className=node.getString("servlet-class",false,true);
        String jspFile=null;
        Holder template=null;
        if(className==null)
        {
            // There is no class, so look for a jsp file
            jspFile=node.getString("jsp-file",false,true);
            if(jspFile!=null)
            {
                Map.Entry entry=getWebApplicationHandler().getHolderEntry(jspFile);
                if(entry!=null)
                {
                    template = (Holder)entry.getValue();
                    className=template.getClassName();  
                }
            }
            if(className==null)
            {
                log.warn("Missing servlet-class|jsp-file in "+node);
                return;
            }
        }
        if(name==null)
            name=className;
        ServletHolder holder=getWebApplicationHandler().newServletHolder(name,className,jspFile);

        // handle JSP configuration
        if(jspFile!=null)
        {
            Enumeration e=template.getInitParameterNames();
            
            while(e.hasMoreElements())
            {   
                String p=(String)e.nextElement();
                holder.setInitParameter(p, template.getInitParameter(p));
            }
            if (holder.getInitParameter("classpath")==null)
                holder.setInitParameter("classpath",getWebApplicationContext().getFileClassPath());
        }
       
        // handle init params
        Iterator iParamsIter=node.iterator("init-param");
        while(iParamsIter.hasNext())
        {
            XmlParser.Node paramNode=(XmlParser.Node)iParamsIter.next();
            String pname=paramNode.getString("param-name",false,true);
            String pvalue=paramNode.getString("param-value",false,true);
            holder.put(pname,pvalue);
        }
        XmlParser.Node startup=node.get("load-on-startup");
        if(startup!=null)
        {
            String s=startup.toString(false,true).toLowerCase();
            if(s.startsWith("t"))
            {
                log.warn("Deprecated boolean load-on-startup.  Please use integer");
                holder.setInitOrder(1);
            }
            else
            {
                int order=0;
                try
                {
                    if(s!=null&&s.trim().length()>0)
                        order=Integer.parseInt(s);
                }
                catch(Exception e)
                {
                    log.warn("Cannot parse load-on-startup "+s+". Please use integer");
                    LogSupport.ignore(log,e);
                }
                holder.setInitOrder(order);
            }
        }
        Iterator sRefsIter=node.iterator("security-role-ref");
        while(sRefsIter.hasNext())
        {
            XmlParser.Node securityRef=(XmlParser.Node)sRefsIter.next();
            String roleName=securityRef.getString("role-name",false,true);
            String roleLink=securityRef.getString("role-link",false,true);
            if(roleName!=null&&roleName.length()>0&&roleLink!=null&&roleLink.length()>0)
            {
                if(log.isDebugEnabled())
                    log.debug("link role "+roleName+" to "+roleLink+" for "+this);
                holder.setUserRoleLink(roleName,roleLink);
            }
            else
            {
                log.warn("Ignored invalid security-role-ref element: "+"servlet-name="+name+", "+securityRef);
            }
        }
        XmlParser.Node run_as=node.get("run-as");
        if(run_as!=null)
        {
            String roleName=run_as.getString("role-name",false,true);
            if(roleName!=null)
                holder.setRunAs(roleName);
        }
    }

    /* ------------------------------------------------------------ */
    protected void initServletMapping(XmlParser.Node node)
    {
        String name=node.getString("servlet-name",false,true);
        String pathSpec=node.getString("url-pattern",false,true);
        getWebApplicationHandler().mapPathToServlet(pathSpec,name);
    }

    /* ------------------------------------------------------------ */
    protected void initListener(XmlParser.Node node)
    {
        String className=node.getString("listener-class",false,true);
        Object listener=null;
        try
        {
            Class listenerClass=getWebApplicationContext().loadClass(className);
            listener=listenerClass.newInstance();
        }
        catch(Exception e)
        {
            log.warn("Could not instantiate listener "+className,e);
            return;
        }
        if(!(listener instanceof EventListener))
        {
            log.warn("Not an EventListener: "+listener);
            return;
        }
        boolean known=false;
        try
        {
            getWebApplicationContext().addEventListener((EventListener)listener);
            known=true;
        }
        catch(Exception e)
        {
            LogSupport.ignore(log,e);
        }
        try
        {
            getWebApplicationHandler().addEventListener((EventListener)listener);
            known=true;
        }
        catch(Exception e)
        {
            LogSupport.ignore(log,e);
        }
        if(!known)
            log.warn("Unknown: "+listener);
    }

    /* ------------------------------------------------------------ */
    protected void initDistributable(XmlParser.Node node)
    {
        // the element has no content, so its simple presence
        // indicates that the webapp is distributable...
        WebApplicationContext wac=getWebApplicationContext();
        if (!wac.isDistributable())
	   wac.setDistributable(true);
    }

    /* ------------------------------------------------------------ */
    protected void initSessionConfig(XmlParser.Node node)
    {
        XmlParser.Node tNode=node.get("session-timeout");
        if(tNode!=null)
        {
            int timeout=Integer.parseInt(tNode.toString(false,true));
            getWebApplicationHandler().setSessionInactiveInterval(timeout*60);
        }
    }

    /* ------------------------------------------------------------ */
    protected void initMimeConfig(XmlParser.Node node)
    {
        String extension=node.getString("extension",false,true);
        if(extension!=null&&extension.startsWith("."))
            extension=extension.substring(1);
        String mimeType=node.getString("mime-type",false,true);
        getWebApplicationContext().setMimeMapping(extension,mimeType);
    }

    /* ------------------------------------------------------------ */
    protected void initWelcomeFileList(XmlParser.Node node)
    {
        Iterator iter=node.iterator("welcome-file");
        while(iter.hasNext())
        {
            XmlParser.Node indexNode=(XmlParser.Node)iter.next();
            String index=indexNode.toString(false,true);
            if(log.isDebugEnabled())
                log.debug("Index: "+index);
            getWebApplicationContext().addWelcomeFile(index);
        }
    }

    /* ------------------------------------------------------------ */
    protected void initLocaleEncodingList(XmlParser.Node node)
    {
        Iterator iter=node.iterator("locale-encoding-mapping");
        while(iter.hasNext())
        {
            XmlParser.Node mapping=(XmlParser.Node)iter.next();
            String locale=mapping.getString("locale",false,true);
            String encoding=mapping.getString("encoding",false,true);
            getWebApplicationContext().addLocaleEncoding(locale,encoding);
        }
    }

    /* ------------------------------------------------------------ */
    protected void initErrorPage(XmlParser.Node node)
    {
        String error=node.getString("error-code",false,true);
        if(error==null||error.length()==0)
            error=node.getString("exception-type",false,true);
        String location=node.getString("location",false,true);
        getWebApplicationContext().setErrorPage(error,location);
    }

    /* ------------------------------------------------------------ */
    protected void initTagLib(XmlParser.Node node)
    {
        String uri=node.getString("taglib-uri",false,true);
        String location=node.getString("taglib-location",false,true);
        getWebApplicationContext().setResourceAlias(uri,location);
    }
    
    /* ------------------------------------------------------------ */
    protected void initJspConfig(XmlParser.Node node)
    {
        for (int i=0;i<node.size();i++)
        {
            Object o=node.get(i);
            if (o instanceof XmlParser.Node && "taglib".equals(((XmlParser.Node)o).getTag()))
                initTagLib((XmlParser.Node)o);
        }
    }

    /* ------------------------------------------------------------ */
    protected void initSecurityConstraint(XmlParser.Node node)
    {
        try
        {
            SecurityConstraint scBase = new SecurityConstraint();
            XmlParser.Node auths = node.get("auth-constraint");
            if (auths != null)
            {
                scBase.setAuthenticate(true);
                // auth-constraint
                Iterator iter = auths.iterator("role-name");
                while (iter.hasNext())
                {
                    String role = ((XmlParser.Node) iter.next()).toString(false, true);
                    scBase.addRole(role);
                }
            }
            XmlParser.Node data = node.get("user-data-constraint");
            if (data != null)
            {
                data = data.get("transport-guarantee");
                String guarantee = data.toString(false, true).toUpperCase();
                if (guarantee == null || guarantee.length() == 0 || "NONE".equals(guarantee))
                    scBase.setDataConstraint(SecurityConstraint.DC_NONE);
                else if ("INTEGRAL".equals(guarantee))
                    scBase.setDataConstraint(SecurityConstraint.DC_INTEGRAL);
                else if ("CONFIDENTIAL".equals(guarantee))
                    scBase.setDataConstraint(SecurityConstraint.DC_CONFIDENTIAL);
                else
                {
                    log.warn("Unknown user-data-constraint:" + guarantee);
                    scBase.setDataConstraint(SecurityConstraint.DC_CONFIDENTIAL);
                }
            }
            Iterator iter = node.iterator("web-resource-collection");
            while (iter.hasNext())
            {
                XmlParser.Node collection = (XmlParser.Node) iter.next();
                String name = collection.getString("web-resource-name", false, true);
                SecurityConstraint sc = (SecurityConstraint) scBase.clone();
                sc.setName(name);
                Iterator iter2 = collection.iterator("http-method");
                while (iter2.hasNext())
                    sc.addMethod(((XmlParser.Node) iter2.next()).toString(false, true));
                iter2 = collection.iterator("url-pattern");
                while (iter2.hasNext())
                {
                    String url = ((XmlParser.Node) iter2.next()).toString(false, true);
                    getWebApplicationContext().addSecurityConstraint(url, sc);
                }
            }
        }
        catch (CloneNotSupportedException e)
        {
            log.fatal(e);
        }
    }

    /* ------------------------------------------------------------ */
    protected void initLoginConfig(XmlParser.Node node)
    {
        XmlParser.Node method=node.get("auth-method");
        FormAuthenticator _formAuthenticator=null;
        if(method!=null)
        {
            Authenticator authenticator=null;
            String m=method.toString(false,true);
            if(SecurityConstraint.__FORM_AUTH.equals(m))
                authenticator=_formAuthenticator=new FormAuthenticator();
            else if(SecurityConstraint.__BASIC_AUTH.equals(m))
                authenticator=new BasicAuthenticator();
            else if(SecurityConstraint.__DIGEST_AUTH.equals(m))
                authenticator=new DigestAuthenticator();
            else if(SecurityConstraint.__CERT_AUTH.equals(m))
                authenticator=new ClientCertAuthenticator();
            else if(SecurityConstraint.__CERT_AUTH2.equals(m))
                authenticator=new ClientCertAuthenticator();
            else
                log.warn("UNKNOWN AUTH METHOD: "+m);
            getWebApplicationContext().setAuthenticator(authenticator);
        }
        XmlParser.Node name=node.get("realm-name");
        if(name!=null)
            getWebApplicationContext().setRealmName(name.toString(false,true));
        XmlParser.Node formConfig=node.get("form-login-config");
        if(formConfig!=null)
        {
            if(_formAuthenticator==null)
                log.warn("FORM Authentication miss-configured");
            else
            {
                XmlParser.Node loginPage=formConfig.get("form-login-page");
                if(loginPage!=null)
                    _formAuthenticator.setLoginPage(loginPage.toString(false,true));
                XmlParser.Node errorPage=formConfig.get("form-error-page");
                if(errorPage!=null)
                {
                    String ep=errorPage.toString(false,true);
                    _formAuthenticator.setErrorPage(ep);
                }
            }
        }
    }

    /* ------------------------------------------------------------ */
    protected void initSecurityRole(XmlParser.Node node)
    {}
}
