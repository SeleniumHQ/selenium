// ========================================================================
// Authors : Van den Broeke Iris, Deville Daniel, Dubois Roger, Greg Wilkins
// Copyright (c) 2001 Deville Daniel. All rights reserved.
// Permission to use, copy, modify and distribute this software
// for non-commercial or commercial purposes and without fee is
// hereby granted provided that this copyright notice appears in
// all copies.
// ========================================================================

package org.openqa.jetty.http.handler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.StringTokenizer;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.http.SecurityConstraint;
import org.openqa.jetty.http.UserRealm;
import org.openqa.jetty.util.B64Code;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.Resource;
import org.openqa.jetty.util.StringUtil;
import org.openqa.jetty.util.URI;
import org.openqa.jetty.util.UnixCrypt;

/* ------------------------------------------------------------ */
/** RestishHandler to authenticate access using the Apache's .htaccess files.
 *
 * @version HTAccessHandler v1.0a
 * @author Van den Broeke Iris
 * @author Deville Daniel
 * @author Dubois Roger
 * @author Greg Wilkins
 * @author Konstantin Metlov
 *
 */
public class HTAccessHandler extends AbstractHttpHandler
{
    private static Log log = LogFactory.getLog(HTAccessHandler.class);

    String _default=null;
    String _accessFile=".htaccess";

    transient HashMap _htCache=new HashMap();

    /* ------------------------------------------------------------ */
    public void handle(String pathInContext,
                       String pathParams,
                       HttpRequest request,
                       HttpResponse response)
            throws HttpException,IOException
    {
        String user=null;
        String password=null;
        boolean IPValid=true;

        if(log.isDebugEnabled())log.debug("HTAccessHandler pathInContext="+pathInContext);

        String credentials=request.getField(HttpFields.__Authorization);

        if (credentials!=null)
        {
            credentials=credentials.substring(credentials.indexOf(' ')+1);
            credentials=B64Code.decode(credentials,StringUtil.__ISO_8859_1);
            int i=credentials.indexOf(':');
            user=credentials.substring(0,i);
            password=credentials.substring(i+1);

            if(log.isDebugEnabled())log.debug("User="+user+", password="+
                    "******************************".substring(0,password.length()));
        }

        HTAccess ht=null;

        try
        {
            Resource resource=null;
            String directory=pathInContext.endsWith("/")
                    ?pathInContext:
                    URI.parentPath(pathInContext);

            // Look for htAccess resource
            while (directory!=null)
            {
                String htPath=directory+_accessFile;
                resource=getHttpContext().getResource(htPath);
                if(log.isDebugEnabled())log.debug("directory="+directory+" resource="+resource);

                if (resource!=null && resource.exists() && !resource.isDirectory())
                    break;
                resource=null;
                directory=URI.parentPath(directory);
            }

            // Try default directory
            if (resource==null && _default!=null)
            {
                resource=Resource.newResource(_default);
                if (!resource.exists() || resource.isDirectory())
                    return;
            }
            if (resource==null)
                return;

            if(log.isDebugEnabled())log.debug("HTACCESS="+resource);

            ht=(HTAccess)_htCache.get(resource);
            if (ht==null || ht.getLastModified()!=resource.lastModified())
            {
                ht=new HTAccess(resource);
                _htCache.put(resource,ht);
                if(log.isDebugEnabled())log.debug("HTCache loaded "+ht);
            }

            // prevent access to htaccess files
            if (pathInContext.endsWith(_accessFile))
            {
                response.sendError(HttpResponse.__403_Forbidden);
                request.setHandled(true);
                return;
            }

            // See if there is a config problem
            if (ht.isForbidden())
            {
                log.warn("Mis-configured htaccess: "+ht);
                response.sendError(HttpResponse.__403_Forbidden);
                request.setHandled(true);
                return;
            }

            //first see if we need to handle based on method type
            Map methods=ht.getMethods();
            if (methods.size()>0 && !methods.containsKey(request.getMethod()))
                return; //Nothing to check

            // Check the accesss
            int satisfy=ht.getSatisfy();

            // second check IP address
            IPValid=ht.checkAccess("",request.getRemoteAddr());
            if(log.isDebugEnabled())log.debug("IPValid = "+IPValid);

            // If IP is correct and satify is ANY then access is allowed
            if (IPValid==true && satisfy==HTAccess.ANY)
                return;

            // If IP is NOT correct and satify is ALL then access is forbidden
            if (IPValid==false && satisfy==HTAccess.ALL)
            {
                response.sendError(HttpResponse.__403_Forbidden);
                request.setHandled(true);
                return;
            }

            // set required page
            if (!ht.checkAuth(user,password,getHttpContext(),request))
            {
                log.debug("Auth Failed");
                response.setField(HttpFields.__WwwAuthenticate,"basic realm="+ht.getName());
                response.sendError(HttpResponse.__401_Unauthorized);
                response.commit();
                request.setHandled(true);
                return;
            }

            // set user
            if (user!=null)
            {
                request.setAuthType(SecurityConstraint.__BASIC_AUTH);
                request.setAuthUser(user);
            }

        }
        catch (Exception ex)
        {
            log.warn(LogSupport.EXCEPTION,ex);
            if (ht!=null)
            {
                response.sendError(HttpResponse.__500_Internal_Server_Error);
                request.setHandled(true);
            }
        }
    }


    /* ------------------------------------------------------------ */
    /** set functions for the following .xml administration statements.
     *
     * <Call name="addHandler">
     * <Arg>
     * <New class="org.openqa.jetty.http.handler.HTAccessHandler">
     * <Set name="Default">./etc/htaccess</Set>
     * <Set name="AccessFile">.htaccess</Set>
     * </New>
     * </Arg>
     * </Call>
     *
     */
    public void setDefault(String dir)
    {
        _default=dir;
    }


    /* ------------------------------------------------------------ */
    public void setAccessFile(String anArg)
    {
        if (anArg==null)
            _accessFile=".htaccess";
        else
            _accessFile=anArg;
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static class HTAccess
    {
        // private boolean _debug = false;
        static final int ANY=0;
        static final int ALL=1;
        static final String USER="user";
        static final String GROUP="group";
        static final String VALID_USER="valid-user";

        /* ------------------------------------------------------------ */
        String _userFile;
        Resource _userResource;
        HashMap _users=null;
        long _userModified;

        /* ------------------------------------------------------------ */
        String _groupFile;
        Resource _groupResource;
        HashMap _groups=null;
        long _groupModified;

        int _satisfy=0;
        String _type;
        String _name;
        HashMap _methods=new HashMap();
        HashSet _requireEntities=new HashSet();
        String _requireName;
        int _order;
        ArrayList _allowList=new ArrayList();
        ArrayList _denyList=new ArrayList();
        long _lastModified;
        boolean _forbidden=false;

        /* ------------------------------------------------------------ */
        public HTAccess(Resource resource)
        {
            BufferedReader htin=null;
            try
            {
                htin=new BufferedReader(new InputStreamReader(resource.getInputStream()));
                parse(htin);
                _lastModified=resource.lastModified();

                if (_userFile!=null)
                {
                    _userResource=Resource.newResource(_userFile);
                    if (!_userResource.exists())
                    {
                        _forbidden=true;
                        log.warn("Could not find ht user file: "+_userFile);
                    }
                    else
                        if(log.isDebugEnabled())log.debug("user file: "+_userResource);
                }

                if (_groupFile!=null)
                {
                    _groupResource=Resource.newResource(_groupFile);
                    if (!_groupResource.exists())
                    {
                        _forbidden=true;
                        log.warn("Could not find ht group file: "+_groupResource);
                    }
                    else
                        if(log.isDebugEnabled())log.debug("group file: "+_groupResource);
                }
            }
            catch (IOException e)
            {
                _forbidden=true;
                log.warn(LogSupport.EXCEPTION,e);
            }
        }

        /* ------------------------------------------------------------ */
        public boolean isForbidden()
        {
            return _forbidden;
        }

        /* ------------------------------------------------------------ */
        public HashMap getMethods()
        {
            return _methods;
        }

        /* ------------------------------------------------------------ */
        public long getLastModified()
        {
            return _lastModified;
        }

        /* ------------------------------------------------------------ */
        public Resource getUserResource()
        {
            return _userResource;
        }

        /* ------------------------------------------------------------ */
        public Resource getGroupResource()
        {
            return _groupResource;
        }

        /* ------------------------------------------------------------ */
        public int getSatisfy()
        {
            return (_satisfy);
        }

        /* ------------------------------------------------------------ */
        public String getName()
        {
            return _name;
        }

        /* ------------------------------------------------------------ */
        public String getType()
        {
            return _type;
        }

        /* ------------------------------------------------------------ */
        public boolean checkAccess(String host,String ip)
        {
            String elm;
            boolean alp=false;
            boolean dep=false;

            // if no allows and no deny defined, then return true
            if (_allowList.size()==0 && _denyList.size()==0)
                return (true);

            // looping for allows
            for (int i=0;i<_allowList.size();i++)
            {
                elm=(String)_allowList.get(i);
                if (elm.equals("all"))
                {
                    alp=true;
                    break;
                }
                else
                {
                    char c=elm.charAt(0);
                    if (c>='0' && c<='9')
                    {
                        // ip
                        if (ip.startsWith(elm))
                        {
                            alp=true;
                            break;
                        }
                    }
                    else
                    {
                        // hostname
                        if (host.endsWith(elm))
                        {
                            alp=true;
                            break;
                        }
                    }
                }
            }

            // looping for denies
            for (int i=0;i<_denyList.size();i++)
            {
                elm=(String)_denyList.get(i);
                if (elm.equals("all"))
                {
                    dep=true;
                    break;
                }
                else
                {
                    char c=elm.charAt(0);
                    if (c>='0' && c<='9')
                    { // ip
                        if (ip.startsWith(elm))
                        {
                            dep=true;
                            break;
                        }
                    }
                    else
                    { // hostname
                        if (host.endsWith(elm))
                        {
                            dep=true;
                            break;
                        }
                    }
                }
            }

            if (_order<0) //deny,allow
                return !dep || alp;
            //mutual failure == allow,deny
            return alp && !dep;
        }

        /* ------------------------------------------------------------ */
        public boolean checkAuth(String user,
                                 String pass,
                                 HttpContext context,
                                 HttpRequest request)
        {
            if (_requireName==null)
                return true;

            // Authenticate with realm
            UserRealm realm=context.getRealm();
            Principal principal=realm==null?null:realm.authenticate(user,pass,request);
            if (principal==null)
            {
                // Have to authenticate the user with the password file
                String code=getUserCode(user);
                String salt=code!=null?code.substring(0,2):user;
                String cred=(user!=null&&pass!=null)?UnixCrypt.crypt(pass,salt):null;
                if (code==null || (code.equals("") && !pass.equals("")) || !code.equals(cred))
                    return false;
            }

            if (_requireName.equalsIgnoreCase(USER))
            {
                if (_requireEntities.contains(user))
                    return true;
            }
            else if (_requireName.equalsIgnoreCase(GROUP))
            {
                ArrayList gps=getUserGroups(user);
                if (gps!=null)
                    for (int g=gps.size();g-->0;)
                        if (_requireEntities.contains(gps.get(g)))
                            return true;
            }
            else if (_requireName.equalsIgnoreCase(VALID_USER))
            {
                return true;
            }
            
            return false;
        }

        /* ------------------------------------------------------------ */
        public boolean isAccessLimited()
        {
            if (_allowList.size()>0 || _denyList.size()>0)
                return true;
            else
                return false;
        }

        /* ------------------------------------------------------------ */
        public boolean isAuthLimited()
        {
            if (_requireName!=null)
                return true;
            else
                return false;
        }

        /* ------------------------------------------------------------ */
        private String getUserCode(String user)
        {
            if (_userResource==null)
                return null;

            if (_users==null || _userModified!=_userResource.lastModified())
            {
                if(log.isDebugEnabled())log.debug("LOAD "+_userResource);
                _users=new HashMap();
                BufferedReader ufin=null;
                try
                {
                    ufin=new BufferedReader(new InputStreamReader(_userResource.getInputStream()));
                    _userModified=_userResource.lastModified();
                    String line;
                    while ((line=ufin.readLine())!=null)
                    {
                        line=line.trim();
                        if (line.startsWith("#")) continue;
                        int spos=line.indexOf(':');
                        if (spos<0)
                            continue;
                        String u=line.substring(0,spos).trim();
                        String p=line.substring(spos+1).trim();
                        _users.put(u,p);
                    }
                }
                catch (IOException e)
                {
                    log.warn(LogSupport.EXCEPTION,e);
                }
                finally
                {
                    try
                    {
                        if (ufin!=null) ufin.close();
                    }
                    catch (IOException e2)
                    {
                        log.warn(LogSupport.EXCEPTION,e2);
                    }
                }
            }

            return (String)_users.get(user);
        }

        /* ------------------------------------------------------------ */
        private ArrayList getUserGroups(String group)
        {
            if (_groupResource==null)
                return null;

            if (_groups==null || _groupModified!=_groupResource.lastModified())
            {
                if(log.isDebugEnabled())log.debug("LOAD "+_groupResource);

                _groups=new HashMap();
                BufferedReader ufin=null;
                try
                {
                    ufin=new BufferedReader(new InputStreamReader(_groupResource.getInputStream()));
                    _groupModified=_groupResource.lastModified();
                    String line;
                    while ((line=ufin.readLine())!=null)
                    {
                        line=line.trim();
                        if (line.startsWith("#") || line.length()==0) continue;

                        StringTokenizer tok=new StringTokenizer(line,": \t");

                        if (!tok.hasMoreTokens())
                            continue;
                        String g=tok.nextToken();
                        if (!tok.hasMoreTokens())
                            continue;
                        while (tok.hasMoreTokens())
                        {
                            String u=tok.nextToken();
                            ArrayList gl=(ArrayList)_groups.get(u);
                            if (gl==null)
                            {
                                gl=new ArrayList();
                                _groups.put(u,gl);
                            }
                            gl.add(g);
                        }
                    }
                }
                catch (IOException e)
                {
                    log.warn(LogSupport.EXCEPTION,e);
                }
                finally
                {
                    try
                    {
                        if (ufin!=null) ufin.close();
                    }
                    catch (IOException e2)
                    {
                        log.warn(LogSupport.EXCEPTION,e2);
                    }
                }
            }
            
            return (ArrayList)_groups.get(group);
        }

        /* ------------------------------------------------------------ */
        public String toString()
        {
            StringBuffer buf=new StringBuffer();

            buf.append("AuthUserFile=");
            buf.append(_userFile);
            buf.append(", AuthGroupFile=");
            buf.append(_groupFile);
            buf.append(", AuthName=");
            buf.append(_name);
            buf.append(", AuthType=");
            buf.append(_type);
            buf.append(", Methods=");
            buf.append(_methods);
            buf.append(", satisfy=");
            buf.append(_satisfy);
            if (_order<0)
                buf.append(", order=deny,allow");
            else if (_order>0)
                buf.append(", order=allow,deny");
            else
                buf.append(", order=mutual-failure");

            buf.append(", Allow from=");
            buf.append(_allowList);
            buf.append(", deny from=");
            buf.append(_denyList);
            buf.append(", requireName=");
            buf.append(_requireName);
            buf.append(" ");
            buf.append(_requireEntities);

            return buf.toString();
        }

        /* ------------------------------------------------------------ */
        private void parse(BufferedReader htin)
                throws IOException
        {
            String line;
            while ((line=htin.readLine())!=null)
            {
                line=line.trim();
                if (line.startsWith("#"))
                    continue;
                else if (line.startsWith("AuthUserFile"))
                {
                    _userFile=line.substring(13).trim();
                }
                else if (line.startsWith("AuthGroupFile"))
                {
                    _groupFile=line.substring(14).trim();
                }
                else if (line.startsWith("AuthName"))
                {
                    _name=line.substring(8).trim();
                }
                else if (line.startsWith("AuthType"))
                {
                    _type=line.substring(8).trim();
                }
                //else if (line.startsWith("<Limit")) {
                else if (line.startsWith("<Limit"))
                {
                    int limit=line.length();
                    int endp=line.indexOf('>');
                    StringTokenizer tkns;

                    if (endp<0) endp=limit;
                    tkns=new StringTokenizer(line.substring(6,endp));
                    while (tkns.hasMoreTokens())
                    {
                        _methods.put(tkns.nextToken(),Boolean.TRUE);
                    }

                    while ((line=htin.readLine())!=null)
                    {
                        line=line.trim();
                        if (line.startsWith("#"))
                            continue;
                        else if (line.startsWith("satisfy"))
                        {
                            int pos1=7;
                            limit=line.length();
                            while ((pos1<limit) && (line.charAt(pos1)<=' ')) pos1++;
                            int pos2=pos1;
                            while ((pos2<limit) && (line.charAt(pos2)>' ')) pos2++;
                            String l_string=line.substring(pos1,pos2);
                            if (l_string.equals("all"))
                                _satisfy=1;
                            else if (l_string.equals("any")) _satisfy=0;
                        }
                        else if (line.startsWith("require"))
                        {
                            int pos1=7;
                            limit=line.length();
                            while ((pos1<limit) && (line.charAt(pos1)<=' ')) pos1++;
                            int pos2=pos1;
                            while ((pos2<limit) && (line.charAt(pos2)>' ')) pos2++;
                            _requireName=line.substring(pos1,pos2).toLowerCase();
                            if (USER.equals(_requireName))
                                _requireName=USER;
                            else if (GROUP.equals(_requireName))
                                _requireName=GROUP;
                            else if (VALID_USER.equals(_requireName))
                                _requireName=VALID_USER;

                            pos1=pos2+1;
                            if (pos1<limit)
                            {
                                while ((pos1<limit) && (line.charAt(pos1)<=' ')) pos1++;

                                tkns=new StringTokenizer(line.substring(pos1));
                                while (tkns.hasMoreTokens())
                                {
                                    _requireEntities.add(tkns.nextToken());
                                }
                            }

                        }
                        else if (line.startsWith("order"))
                        {
                            if(log.isDebugEnabled())log.debug("orderline="+line+"order="+_order);
                            if (line.indexOf("allow,deny")>0)
                            {
                                log.debug("==>allow+deny");
                                _order=1;
                            }
                            else if (line.indexOf("deny,allow")>0)
                            {
                                log.debug("==>deny,allow");
                                _order=-1;
                            }
                            else if (line.indexOf("mutual-failure")>0)
                            {
                                log.debug("==>mutual");
                                _order=0;
                            }
                            else
                            {
                            }
                        }
                        else if (line.startsWith("allow from"))
                        {
                            int pos1=10;
                            limit=line.length();
                            while ((pos1<limit) && (line.charAt(pos1)<=' ')) pos1++;
                            if(log.isDebugEnabled())log.debug("allow process:"+line.substring(pos1));
                            tkns=new StringTokenizer(line.substring(pos1));
                            while (tkns.hasMoreTokens())
                            {
                                _allowList.add(tkns.nextToken());
                            }
                        }
                        else if (line.startsWith("deny from"))
                        {
                            int pos1=9;
                            limit=line.length();
                            while ((pos1<limit) && (line.charAt(pos1)<=' ')) pos1++;
                            if(log.isDebugEnabled())log.debug("deny process:"+line.substring(pos1));

                            tkns=new StringTokenizer(line.substring(pos1));
                            while (tkns.hasMoreTokens())
                            {
                                _denyList.add(tkns.nextToken());
                            }
                        }
                        else if (line.startsWith("</Limit>")) break;
                    }
                }
            }
        }
    }
}
