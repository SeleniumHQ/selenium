// ========================================================================
// $Id: DigestAuthenticator.java,v 1.16 2005/08/13 00:01:24 gregwilkins Exp $
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

import java.io.IOException;
import java.security.MessageDigest;
import java.security.Principal;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.B64Code;
import org.openqa.jetty.util.Credential;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.QuotedStringTokenizer;
import org.openqa.jetty.util.StringUtil;
import org.openqa.jetty.util.TypeUtil;

/* ------------------------------------------------------------ */
/** DIGEST authentication.
 *
 * @version $Id: DigestAuthenticator.java,v 1.16 2005/08/13 00:01:24 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class DigestAuthenticator implements Authenticator
{
    static Log log = LogFactory.getLog(DigestAuthenticator.class);

    protected long maxNonceAge=0;
    protected long nonceSecret=this.hashCode() ^ System.currentTimeMillis();
    protected boolean useStale=false;
    
    
    /* ------------------------------------------------------------ */
    /** 
     * @return UserPrinciple if authenticated or null if not. If
     * Authentication fails, then the authenticator may have committed
     * the response as an auth challenge or redirect.
     * @exception IOException 
     */
    public Principal authenticate(UserRealm realm,
                                           String pathInContext,
                                           HttpRequest request,
                                           HttpResponse response)
        throws IOException
    {
        // Get the user if we can
        boolean stale=false;
        Principal user=null;
        String credentials = request.getField(HttpFields.__Authorization);
        
        if (credentials!=null )
        {
            if(log.isDebugEnabled())log.debug("Credentials: "+credentials);
            QuotedStringTokenizer tokenizer = new QuotedStringTokenizer(credentials,
                                                                        "=, ",
                                                                        true,
                                                                        false);
            Digest digest=new Digest(request.getMethod());
            String last=null;
            String name=null;

          loop:
            while (tokenizer.hasMoreTokens())
            {
                String tok = tokenizer.nextToken();
                char c=(tok.length()==1)?tok.charAt(0):'\0';

                switch (c)
                {
                  case '=':
                      name=last;
                      last=tok;
                      break;
                  case ',':
                      name=null;
                  case ' ':
                      break;

                  default:
                      last=tok;
                      if (name!=null)
                      {
                          if ("username".equalsIgnoreCase(name))
                              digest.username=tok;
                          else if ("realm".equalsIgnoreCase(name))
                              digest.realm=tok;
                          else if ("nonce".equalsIgnoreCase(name))
                              digest.nonce=tok;
                          else if ("nc".equalsIgnoreCase(name))
                              digest.nc=tok;
                          else if ("cnonce".equalsIgnoreCase(name))
                              digest.cnonce=tok;
                          else if ("qop".equalsIgnoreCase(name))
                              digest.qop=tok;
                          else if ("uri".equalsIgnoreCase(name))
                              digest.uri=tok;
                          else if ("response".equalsIgnoreCase(name))
                              digest.response=tok;
                          break;
                      }
                }
            }            

            int n=checkNonce(digest.nonce,request);
            if (n>0)
                user = realm.authenticate(digest.username,digest,request);
            else if (n==0)
                stale = true;
            
            if (user==null)
                log.warn("AUTH FAILURE: user "+digest.username);
            else    
            {
                request.setAuthType(SecurityConstraint.__DIGEST_AUTH);
                request.setAuthUser(digest.username);
                request.setUserPrincipal(user);                
            }
        }

        // Challenge if we have no user
        if (user==null && response!=null)
            sendChallenge(realm,request,response,stale);
        
        return user;
    }
    
    /* ------------------------------------------------------------ */
    public String getAuthMethod()
    {
        return SecurityConstraint.__DIGEST_AUTH;
    }
    
    /* ------------------------------------------------------------ */
    public void sendChallenge(UserRealm realm,
                              HttpRequest request,
                              HttpResponse response,
                              boolean stale)
        throws IOException
    {
        response.setField(HttpFields.__WwwAuthenticate,
			    "Digest realm=\""+realm.getName()+
			    "\", domain=\""+
			    response.getHttpContext().getContextPath() +
			    "\", nonce=\""+newNonce(request)+
			    "\", algorithm=MD5, qop=\"auth\"" + (useStale?(" stale="+stale):"")
                          );
        
        response.sendError(HttpResponse.__401_Unauthorized);
    }

    /* ------------------------------------------------------------ */
    public String newNonce(HttpRequest request)
    {
        long ts=request.getTimeStamp();
        long sk=nonceSecret;
        
        byte[] nounce = new byte[24];
        for (int i=0;i<8;i++)
        {
            nounce[i]=(byte)(ts&0xff);
            ts=ts>>8;
            nounce[8+i]=(byte)(sk&0xff);
            sk=sk>>8;
        }
        
        byte[] hash=null;
        try
        {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.reset();
            md.update(nounce,0,16);
            hash = md.digest();
        }
        catch(Exception e)
        {
            log.fatal(this,e);
        }
        
        for (int i=0;i<hash.length;i++)
        {
            nounce[8+i]=hash[i];
            if (i==23)
                break;
        }
        
        return new String(B64Code.encode(nounce));
    }

    /**
     * @param nonce
     * @param request
     * @return -1 for a bad nonce, 0 for a stale none, 1 for a good nonce
     */
    /* ------------------------------------------------------------ */
    public int checkNonce(String nonce, HttpRequest request)
    {
        try
        {
            byte[] n = B64Code.decode(nonce.toCharArray());
            if (n.length!=24)
                return -1;
            
            long ts=0;
            long sk=nonceSecret;
            byte[] n2 = new byte[16];
            for (int i=0;i<8;i++)
            {
                n2[i]=n[i];
                n2[8+i]=(byte)(sk&0xff);
                sk=sk>>8;
                ts=(ts<<8)+(0xff&(long)n[7-i]);
            }
            
            long age=request.getTimeStamp()-ts;
	    if (log.isDebugEnabled()) log.debug("age="+age);
            
            byte[] hash=null;
            try
            {
                MessageDigest md = MessageDigest.getInstance("MD5");
                md.reset();
                md.update(n2,0,16);
                hash = md.digest();
            }
            catch(Exception e)
            {
                log.fatal(this,e);
            }
            
            for (int i=0;i<16;i++)
                if (n[i+8]!=hash[i])
                    return -1;
                
            if(maxNonceAge>0 && (age<0 || age>maxNonceAge))
                return 0; // stale
            
            return 1;
        }
        catch(Exception e)
        {
            log.debug("",e);
        }
        return -1;
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static class Digest extends Credential
    {
        String method=null;
        String username = null;
        String realm = null;
        String nonce = null;
        String nc = null;
        String cnonce = null;
        String qop = null;
        String uri = null;
        String response=null;
        
        /* ------------------------------------------------------------ */
        Digest(String m)
        {
            method=m;
        }
        
        /* ------------------------------------------------------------ */
        public boolean check(Object credentials)
        {
            String password=(credentials instanceof String)
                ?(String)credentials
                :credentials.toString();
            
            try{
                MessageDigest md = MessageDigest.getInstance("MD5");
                byte[] ha1;
                if(credentials instanceof Credential.MD5)
                {
                    // Credentials are already a MD5 digest - assume it's in
                    // form user:realm:password (we have no way to know since 
                    // it's a digest, alright?)
                    ha1 = ((Credential.MD5)credentials).getDigest();
                }
                else
                {
                    // calc A1 digest
                    md.update(username.getBytes(StringUtil.__ISO_8859_1));
                    md.update((byte)':');
                    md.update(realm.getBytes(StringUtil.__ISO_8859_1));
                    md.update((byte)':');
                    md.update(password.getBytes(StringUtil.__ISO_8859_1));
                    ha1=md.digest();
                }
                // calc A2 digest
                md.reset();
                md.update(method.getBytes(StringUtil.__ISO_8859_1));
                md.update((byte)':');
                md.update(uri.getBytes(StringUtil.__ISO_8859_1));
                byte[] ha2=md.digest();
                
                
                
                
                
                // calc digest
                // request-digest  = <"> < KD ( H(A1), unq(nonce-value) ":" nc-value ":" unq(cnonce-value) ":" unq(qop-value) ":" H(A2) ) <">
                // request-digest  = <"> < KD ( H(A1), unq(nonce-value) ":" H(A2) ) > <">

                
                
                md.update(TypeUtil.toString(ha1,16).getBytes(StringUtil.__ISO_8859_1));
                md.update((byte)':');
                md.update(nonce.getBytes(StringUtil.__ISO_8859_1));
                md.update((byte)':');
                md.update(nc.getBytes(StringUtil.__ISO_8859_1));
                md.update((byte)':');
                md.update(cnonce.getBytes(StringUtil.__ISO_8859_1));
                md.update((byte)':');
                md.update(qop.getBytes(StringUtil.__ISO_8859_1));
                md.update((byte)':');
                md.update(TypeUtil.toString(ha2,16).getBytes(StringUtil.__ISO_8859_1));
                byte[] digest=md.digest();
                
                // check digest
                return (TypeUtil.toString(digest,16).equalsIgnoreCase(response));
            }
            catch (Exception e)
            {log.warn(LogSupport.EXCEPTION,e);}

            return false;
        }

        public String toString()
        {
            return username+","+response;
        }
        
    }
    /**
     * @return Returns the maxNonceAge.
     */
    public long getMaxNonceAge()
    {
        return maxNonceAge;
    }
    /**
     * @param maxNonceAge The maxNonceAge to set.
     */
    public void setMaxNonceAge(long maxNonceAge)
    {
        this.maxNonceAge = maxNonceAge;
    }
    /**
     * @return Returns the nonceSecret.
     */
    public long getNonceSecret()
    {
        return nonceSecret;
    }
    /**
     * @param nonceSecret The nonceSecret to set.
     */
    public void setNonceSecret(long nonceSecret)
    {
        this.nonceSecret = nonceSecret;
    }

    public void setUseStale(boolean us)
    {
	this.useStale=us;
    }

    public boolean getUseStale()
    {
	return useStale;
    }
}
    
