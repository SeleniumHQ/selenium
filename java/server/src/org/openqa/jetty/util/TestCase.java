// ========================================================================
// $Id: TestCase.java,v 1.8 2005/08/13 00:01:28 gregwilkins Exp $
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

package org.openqa.jetty.util;

import java.io.InputStream;
import java.util.Enumeration;
import java.util.Vector;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

/*-------------------------------------------------------------------*/
/** Test Harness and report.
 * Test Harness for production of standard test reports:
 *
 * <pre>
 *      Test t1 = new Test("All_Pass");
 *      Test t2 = new Test("All_Fail");
 *
 *      t1.check(true,"Boolean check that passes");
 *      t2.check(false,"Boolean check that fails");
 *      t1.checkEquals("Foo","Foo","Object comparison that passes");
 *      t2.checkEquals("Foo","Bar","Object comparison that fails");
 *      t1.checkEquals(1,1,"Long comparison that passes");
 *      t2.checkEquals(1,2,"Long comparison that fails");
 *      t1.checkEquals(1.1,1.1,"Double comparison that passes");
 *      t2.checkEquals(1.1,2.2,"Double comparison that fails");
 *      t1.checkEquals('a','a',"Char comparison that passes");
 *      t2.checkEquals('a','b',"Char comparison that fails");
 *      
 *      Test.report();
 * </pre>
 *
 * @see org.openqa.jetty.util.CodeException
 * @version $Id: TestCase.java,v 1.8 2005/08/13 00:01:28 gregwilkins Exp $
 * @author Greg Wilkins
 */
public class TestCase
{
    private static Log log = LogFactory.getLog(TestCase.class);

    /*-------------------------------------------------------------------*/
    private static Vector tests = new Vector();
    private static final String fail = "FAIL";
    private static final char[] spaces = "                                                                                 ".toCharArray();
    
    static final String SelfFailTest =
        "org.openqa.jetty.util.TestCase all fail";
    
    /*-------------------------------------------------------------------*/
    private String testCase;
    private StringBuffer reportBuf=new StringBuffer(512);
    private boolean passed = true;
    
    /*-------------------------------------------------------------------*/
    /** TestCase constructor.
     *  @param testCase   the name of the test case
     */
    public TestCase(String testCase)
    {
        if(log.isDebugEnabled())log.debug("Constructed test case: "+testCase);
        this.testCase=testCase;
        tests.addElement(this);
    }
    
    /*-------------------------------------------------------------------*/
    /** Check a boolean test case.
     *  @param b        Boolean to check
     *  @param check    Description of this check
     */
    public void check(boolean b,String check)
    {
        if (!b)
        {
            reportBuf.append(testCase+" : "+check+" - ");
            passed=false;
            reportBuf.append(fail);
            reportBuf.append('\n');
            reportBuf.append(spaces,0,testCase.length()+3);
            reportBuf.append("check!=true");
            if(log.isDebugEnabled())log.debug(check+" FAILED");
        }
        reportBuf.append('\n');
    }
    
    
    /*-------------------------------------------------------------------*/
    /** Check that string contains a substring.
     *  @return Index of substring
     */
    public int checkContains(String string, String subString, String check)
    {
        return realCheckContains(string,0,subString,check);
    }
    
    /*-------------------------------------------------------------------*/
    /** Check that string contains a substring.
     *  @return Index of substring
     */
    public int checkContains(String string,
                             int offset,
                             String subString, String check)
    {
        return realCheckContains(string,offset,subString,check);
    }
    
    /*-------------------------------------------------------------------*/
    /** Check that string contains a substring.
     *  @return Index of substring
     */
    public int realCheckContains(String string,
                                 int offset,
                                 String subString, String check)
    {
        int index=-1;
        if ((string==null && subString==null)
            || (string!=null && (subString==null ||
                                 (index=string.indexOf(subString,offset))>=0)))
        {
          // do nothing
        }
        else
        {
            reportBuf.append(testCase+" : "+check+" - ");
            passed=false;
            reportBuf.append(fail);
            reportBuf.append('\n');
            reportBuf.append(spaces,0,testCase.length()+3);
            reportBuf.append('"' + subString + "\" not contained in \"" );
            
            if (offset<string.length())
                reportBuf.append(string.substring(offset));
            else
                reportBuf.append("string<offset:"+offset+":'"+string+"'");
            reportBuf.append("\"");
            if(log.isDebugEnabled())log.debug(check+" FAILED: "+reportBuf.toString());
            reportBuf.append('\n');
        }
        return index;
    }
    
 
    /*-------------------------------------------------------------------*/
    /** Check that string does not contain a substring.
     *  @return Index of substring
     */
    public int checkNotContained(String string, String subString, String check)
    {
        return checkNotContained(string,0,subString,check);
    }
    
    /*-------------------------------------------------------------------*/
    /** Check that string does not contain a substring.
     *  @return Index of substring
     */
    public int checkNotContained(String string,
                                 int offset,
                                 String subString, String check)
    {
        int index=-1;
        if ((string==null && subString==null)
            || (string!=null && (subString==null ||
                                 (index=string.indexOf(subString,offset))>=0)))
        {
            reportBuf.append(testCase+" : "+check+" - ");
            passed=false;
            reportBuf.append(fail);
            reportBuf.append('\n');
            reportBuf.append(spaces,0,testCase.length()+3);
            reportBuf.append('"' + subString + "\" IS contained in \"" +
                             string.substring(offset) + '"');
            if(log.isDebugEnabled())log.debug(check+" FAILED");
            reportBuf.append('\n');
        }
        return index;
    }
    
 
    
    /*-------------------------------------------------------------------*/
    /** Check a pair of objects for equality test case.
     *  @param o1       First object to compare
     *  @param o2       Second object to compare
     *  @param check    Description of this check
     */
    public void checkEquals(Object o1,Object o2,String check)
    {
        commonCheckEquals(o1,o2,check);
    }
    
    /*-------------------------------------------------------------------*/
    /** Check a a pair of longs for equality.
     *  @param l1       First Long to compare
     *  @param l2       Second Long to compare
     *  @param check    Description of this check
     */
    public void checkEquals(long l1,long l2,String check)
    {
        commonCheckEquals(new Long(l1),new Long(l2),check);
    }
    
    /*-------------------------------------------------------------------*/
    /** Check a a pair of doubles for equality.
     *  @param d1       First double to compare
     *  @param d2       Second double to compare
     *  @param check    Description of this check
     */
    public void checkEquals(double d1,double d2,String check)
    {
        commonCheckEquals(new Double(d1),new Double(d2),check);
    }
    
    /*-------------------------------------------------------------------*/
    /** Check a a pair of chars for equality.
     *  @param c1       First char to compare
     *  @param c2       Second char to compare
     *  @param check    Description of this check
     */
    public void checkEquals(char c1,char c2,String check)
    {
        commonCheckEquals(new Character(c1),new Character(c2),check);
    }

    /*-------------------------------------------------------------------*/
    /** Check contents of a pair of InputStreams for equality.
     * @param in1 First InputStream
     * @param in2 Second InputStream
     * @param check Description
     */
    public void checkEquals(InputStream in1,InputStream in2,String check)
    {
        int c1;
        int c2;
        try{
            while ((c1=in1.read())==(c2=in2.read()))
            {
                if (c1==-1)
                {
                    commonCheckEquals(null,null,check);
                    return;
                }
            }
            commonCheckEquals(""+c1,""+c2,check);
        }
        catch(Exception e)
        {
            commonCheckEquals(e.toString(),null,check);
        }
    }
    
   /*-------------------------------------------------------------------*/
    /** Internal check a pair of objects for equality test case.
     *  @param o1       First object to compare
     *  @param o2       Second object to compare
     *  @param check    Description of this check
     */
    private void commonCheckEquals(Object o1,Object o2,String check)
    {
        if (o1==o2 || ( o1!=null && o1.equals(o2)))
        {
          // do nothing
        }
        else
        {
            reportBuf.append(testCase+" : "+check+" - ");
            passed=false;
            reportBuf.append(fail);
            reportBuf.append('\n');
            reportBuf.append(spaces,0,testCase.length()+3);
            reportBuf.append(((o1!=null)?(o1.toString()):"null") + " != " +
                             ((o2!=null)?(o2.toString()):"null"));
            if(log.isDebugEnabled())log.debug(3+check+" FAILED");
            reportBuf.append('\n');
        }
    }

    /*-------------------------------------------------------------------*/
    /** Produce test report.
     *  
     */
    public static void report()
    {
        Enumeration e = tests.elements();
        while (e.hasMoreElements())
        {
            TestCase t = (TestCase) e.nextElement();
            if (! t.passed) {
                System.err.print("\nTest Case: "+t.testCase);
                System.err.println("  - FAILED");
                System.err.println(t.reportBuf.toString());
            }
        }

        System.err.println("\nTEST SUMMARY:");
        e = tests.elements();
        boolean failed=false;
        while (e.hasMoreElements())
        {
            TestCase t = (TestCase) e.nextElement();
            if (!t.passed)
            {
                if (!t.testCase.equals(SelfFailTest))
                {
                    System.err.print("Test Case: "+t.testCase);
                    System.err.println("  - FAILED");
                    failed=true;
                }
            }
        }
        if (failed)
            System.exit(1);
        System.exit(0);
    }
}
