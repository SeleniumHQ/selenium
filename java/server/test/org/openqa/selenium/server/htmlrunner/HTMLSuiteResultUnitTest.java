// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.server.htmlrunner;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class HTMLSuiteResultUnitTest {

  @Test
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
