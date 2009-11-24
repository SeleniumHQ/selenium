// ========================================================================
// $Id: TestConfiguration.java,v 1.4 2004/05/09 20:33:36 gregwilkins Exp $
// Copyright 1997-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.xml;
import java.net.URL;
import java.util.HashMap;

/* ------------------------------------------------------------ */
/** Test XmlConfiguration. 
 *
 * @version $Revision: 1.4 $
 * @author Greg Wilkins (gregw)
 */
public class TestConfiguration extends HashMap
{
    public static int VALUE=77;

    public TestConfiguration nested;
    public Object testObject;
    public int testInt;
    public URL url;
    public static boolean called=false;
    public Object[] oa;
    public int[] ia;
    private int test;
    public int testField1;
    public int testField2;
    
    public void setTest(Object value)
    {
        testObject=value;
    }
    
    public void setTest(int value)
    {
        testInt=value;
    }

    public void call()
    {
        put("Called","Yes");
    }
    
    public TestConfiguration call(Boolean b)
    {
        nested=new TestConfiguration();
        nested.put("Arg",b);
        return nested;
    }
    
    public void call(URL u,boolean b)
    {
        put("URL",b?"1":"0");
        url=u;
    }

    public String getString()
    {
        return "String";
    }

    public static void callStatic()
    {
        called=true;
    }
    
    public void call(Object[] oa)
    {
        this.oa=oa;
    }
    
    public void call(int[] ia)
    {
        this.ia=ia;
    }
}






