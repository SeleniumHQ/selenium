// ========================================================================
// $Id: Tests.java,v 1.6 2004/05/09 20:33:31 gregwilkins Exp $
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

package org.openqa.jetty.http.handler;

import junit.framework.TestSuite;


/* ------------------------------------------------------------ */

/** Util meta JUnitTestHarness.
 * @version $Id: Tests.java,v 1.6 2004/05/09 20:33:31 gregwilkins Exp $
 * @author Juancarlo Añez <juancarlo@modelistica.com>
 * @author Brett Sealey
 */
public class Tests extends junit.framework.TestCase
{
    /* ------------------------------------------------------------ */
    /** Create the named test case.
     * @param name The name of the test case.
     */
    public Tests(String name)
    {
        super(name);
    }

    /* ------------------------------------------------------------ */
    /** Get the Test suite for the org.openqa.jetty.http.handler package.
     * @return A TestSuite for this package.
     */
    public static junit.framework.Test suite()
    {
        TestSuite testSuite = new TestSuite(Tests.class);
        testSuite.addTest(TestSetResponseHeadersHandler.suite());
        return testSuite;
    }

    /* ------------------------------------------------------------ */
    /** main.
     */
    public static void main(String[] args)
    {
        junit.textui.TestRunner.run(suite());
    }

    public void testPlaceHolder()
    {
        assertTrue(true);
    }
}
