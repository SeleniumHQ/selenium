// ========================================================================
// $Id: Tests.java,v 1.7 2004/09/21 04:27:04 gregwilkins Exp $
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

package org.openqa.jetty.http;

import junit.framework.TestSuite;


/* ------------------------------------------------------------ */
/** Util meta JUnitTestHarness.
 * @version $Id: Tests.java,v 1.7 2004/09/21 04:27:04 gregwilkins Exp $
 * @author Juancarlo A�ez <juancarlo@modelistica.com>
 */
public class Tests extends junit.framework.TestCase
{
    public Tests(String name)
    {
      super(name);
    }

    public static junit.framework.Test suite() 
    {
        TestSuite suite=new TestSuite(Tests.class);
        suite.addTestSuite(TestRequest.class);
        return suite;
    }

    /* ------------------------------------------------------------ */
    /** main.
     */
    public static void main(String[] args)
    {
      junit.textui.TestRunner.run(suite());
    }

    public void testISODate()
    {
      System.err.println(HttpFields.formatDate(System.currentTimeMillis(),  true));
      System.err.println(HttpFields.formatDate(System.currentTimeMillis(), false));

      assertEquals("Thu, 01 Jan 1970 00:00:00 GMT",HttpFields.formatDate(0,false));
      assertEquals("Thu, 01-Jan-70 00:00:01 GMT",HttpFields.formatDate(1000,true));

      assertEquals("Thu, 01 Jan 1970 00:01:00 GMT",HttpFields.formatDate(60000,false));
      assertEquals("Thu, 01-Jan-70 00:01:01 GMT",HttpFields.formatDate(61000,true));
      
      
      assertTrue(true);
    }
}
