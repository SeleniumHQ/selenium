/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.thoughtworks.selenium;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;
import com.thoughtworks.selenium.launchers.WindowsDefaultBrowserLauncher;

/**
 * @author Paul Hammant
 * @version $Revision: 1.2 $
 */
public class DefaultSeleniumTestCase extends MockObjectTestCase {

    public void testOpenWorking() {
        Mock commandProcessor = new Mock(CommandProcessor.class);
        commandProcessor.expects(once()).method("doCommand").with(eq("open"), eq("123.com"), eq("")).will(returnValue("open-done"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        assertEquals(true, dftSelenium.open("123.com"));
    }

    public void testOpenFailing() {
        Mock commandProcessor = new Mock(CommandProcessor.class);
        commandProcessor.expects(once()).method("doCommand").with(eq("open"), eq("123.com"), eq("")).will(returnValue("dfsdfasde"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        assertEquals(false, dftSelenium.open("123.com"));
    }

    public void testClickWorking() {
        Mock commandProcessor = new Mock(CommandProcessor.class);
        commandProcessor.expects(once()).method("doCommand").with(eq("click"), eq("foobar"), eq("")).will(returnValue("click-done"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        assertEquals(true, dftSelenium.click("foobar"));
    }

    public void testClickFailing() {
        Mock commandProcessor = new Mock(CommandProcessor.class);
        commandProcessor.expects(once()).method("doCommand").with(eq("click"), eq("foobar"), eq("")).will(returnValue("dfg sfdg dd"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        assertEquals(false, dftSelenium.click("foobar"));
    }

    public void testSetTextWorking() {
        Mock commandProcessor = new Mock(CommandProcessor.class);
        commandProcessor.expects(once()).method("doCommand").with(eq("setText"), eq("whatsit"), eq("something")).will(returnValue("setText-done"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        assertEquals(true, dftSelenium.setTextField("whatsit", "something"));
    }

    public void testSetTextFailing() {
        Mock commandProcessor = new Mock(CommandProcessor.class);
        commandProcessor.expects(once()).method("doCommand").with(eq("setText"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        assertEquals(false, dftSelenium.setTextField("whatsit", "something"));
    }

    public void testEndWorking() {
        Mock commandProcessor = new Mock(CommandProcessor.class);
        commandProcessor.expects(once()).method("doCommand").with(eq("end"), eq(""), eq("")).will(returnValue(""));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.endOfRun();
    }

}
