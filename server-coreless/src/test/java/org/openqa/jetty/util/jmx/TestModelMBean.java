// ========================================================================
// $Id: TestModelMBean.java,v 1.3 2004/05/09 20:33:35 gregwilkins Exp $
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

package org.openqa.jetty.util.jmx;

import javax.management.MBeanException;
import javax.management.MBeanOperationInfo;
import javax.management.modelmbean.ModelMBeanAttributeInfo;
import javax.management.modelmbean.ModelMBeanOperationInfo;


/* ------------------------------------------------------------ */
/** Test ModelMBeanImpl
 *
 * @version $Revision: 1.3 $
 * @author Greg Wilkins (gregw)
 */
public class TestModelMBean extends ModelMBeanImpl
{    
    /* ------------------------------------------------------------ */
    private Float www=null;
    private String xxx="init";
    private int yyy=42;
    private boolean zzz=false;

    /* ------------------------------------------------------------ */
    public TestModelMBean()
        throws Exception
    {
        setManagedResource(this,"objectreference");
        
        defineAttribute(new ModelMBeanAttributeInfo("www",
                                                    "java.lang.Float",
                                                    "Description",
                                                    true,
                                                    true,
                                                    false));
        defineAttribute("xxx");
        defineAttribute("yyy");
        defineAttribute("zzz");
        

        defineOperation("call",MBeanOperationInfo.ACTION);
        defineOperation("call",
                        new String[]{"int","java.lang.String"},
                        MBeanOperationInfo.ACTION);

        try
        {
            defineOperation(new ModelMBeanOperationInfo
                ("Blah Blah Blah",TestModelMBean.class.getMethod
                 ("call",new Class[]{java.net.URL.class})));
        }
        catch(Exception e)
        {
            throw new MBeanException(e);
        }
    }
    
    /* ------------------------------------------------------------ */
    public Float getWww()
    {
        System.err.println("getWww");
        return www;
    }

    /* ------------------------------------------------------------ */
    public void setWww(Float f)
    {
        System.err.println("setWww");
        www=f;
    }

    /* ------------------------------------------------------------ */
    public String getXxx()
    {
        System.err.println("getXxx");
        return xxx;
    }

    /* ------------------------------------------------------------ */
    public void setXxx(String a)
    {
        System.err.println("setXxx");
        xxx=a;
    }

    /* ------------------------------------------------------------ */
    public int getYyy()
    {
        System.err.println("getYyy");
        return yyy;
    }

    /* ------------------------------------------------------------ */
    public void setYyy(int a)
    {
        System.err.println("setYyy");
        yyy=a;
    }
    
    /* ------------------------------------------------------------ */
    public boolean isZzz()
    {
        System.err.println("isZzz");
        return zzz;
    }

    /* ------------------------------------------------------------ */
    public void setZzz(boolean z)
    {
        System.err.println("setZzz");
        zzz=z;
    }

    /* ------------------------------------------------------------ */
    public void call()
    {
        System.err.println("call");
        xxx="Call";
    }
    
    /* ------------------------------------------------------------ */
    public String call(int i, String s)
    {
        System.err.println("call");
        xxx="Call("+i+","+s+")";
        return xxx;
    }
    
    /* ------------------------------------------------------------ */
    public void call(java.net.URL u)
    {
        System.err.println("call");
        xxx=u.toString();
    }

    
}
