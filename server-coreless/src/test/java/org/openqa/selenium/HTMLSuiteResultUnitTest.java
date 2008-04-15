/*
 * Created on Oct 12, 2006
 *
 */
package org.openqa.selenium;

import org.openqa.selenium.server.htmlrunner.*;

import junit.framework.*;

public class HTMLSuiteResultUnitTest extends TestCase {

    public void testBasic() {
        String input = "\r\n" + 
        "\r\n" + 
        "<table border=\"1\" cellpadding=\"1\" cellspacing=\"1\">\r\n" + 
        "        <tbody>\r\n" + 
        "            <tr class=\"title status_passed\"><td><b>Test Suite</b></td></tr>\r\n" + 
        "            <tr class=\"status_passed\"><td><a href=\"./TestQuickOpen.html\">TestQuickOpen</a></td></tr>\r\n" + 
        "            <tr class=\"status_passed\"><td><a href=\"./TestQuickOpen.html\">TestQuickOpen</a></td></tr>\r\n" + 
        "            <tr class=\"status_passed\"><td><a href=\"./TestQuickOpen.html\">TestQuickOpen</a></td></tr>\r\n" + 
        "            <tr class=\"status_passed\"><td><a href=\"./TestQuickOpen.html\">TestQuickOpen</a></td></tr>\r\n" + 
        "        </tbody>\r\n" + 
        "    </table>\r\n" + 
        "\r\n" + 
        "";
        HTMLSuiteResult hsr = new HTMLSuiteResult(input);
        // System.out.println(hsr.getUpdatedSuite());
        String expected = "\r\n" + 
        "\r\n" + 
        "<table border=\"1\" cellpadding=\"1\" cellspacing=\"1\">\r\n" + 
        "        <tbody>\r\n" + 
        "            <tr class=\"title status_passed\"><td><b>Test Suite</b></td></tr>\r\n" + 
        "            <tr class=\"status_passed\"><td><a href=\"#testresult0\">TestQuickOpen</a></td></tr>\r\n" + 
        "            <tr class=\"status_passed\"><td><a href=\"#testresult1\">TestQuickOpen</a></td></tr>\r\n" + 
        "            <tr class=\"status_passed\"><td><a href=\"#testresult2\">TestQuickOpen</a></td></tr>\r\n" + 
        "            <tr class=\"status_passed\"><td><a href=\"#testresult3\">TestQuickOpen</a></td></tr>\r\n" + 
        "        </tbody>\r\n" + 
        "    </table>\r\n" + 
        "\r\n" + 
        "";
        assertEquals(expected, hsr.getUpdatedSuite());
        
    }
}
