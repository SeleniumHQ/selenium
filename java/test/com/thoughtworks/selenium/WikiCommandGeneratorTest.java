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

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.3 $
 */
public class WikiCommandGeneratorTest extends MockObjectTestCase {
    public void testShouldGenerateWikiForBrowserOpen() {
        Mock commandHandler = mock(CommandExecutor.class);
        commandHandler.expects(once()).method("execute").with(eq("|open|/somePage||"));
        WikiCommandGenerator commandGenerator = new WikiCommandGenerator((CommandExecutor) commandHandler.proxy());
        Browser browser = (Browser) commandGenerator.proxy(Browser.class);
        browser.open("/somePage");
    }

    public void testShouldGenerateWikiForBrowserClick() {
        Mock commandHandler = mock(CommandExecutor.class);
        commandHandler.expects(once()).method("execute").with(eq("|click|linkWithJavascript|nowait|"));
        WikiCommandGenerator commandGenerator = new WikiCommandGenerator((CommandExecutor) commandHandler.proxy());
        Browser browser = (Browser) commandGenerator.proxy(Browser.class);
        browser.click("linkWithJavascript", "nowait");
    }

    public void testShouldGenerateWikiForBrowserPause() {
        Mock commandHandler = mock(CommandExecutor.class);
        commandHandler.expects(once()).method("execute").with(eq("|pause|5000||"));
        WikiCommandGenerator commandGenerator = new WikiCommandGenerator((CommandExecutor) commandHandler.proxy());
        Browser browser = (Browser) commandGenerator.proxy(Browser.class);
        browser.pause(5000);
    }

    public void testShouldGenerateWikiForBrowserVerifyTable() {
        Mock commandHandler = mock(CommandExecutor.class);
        commandHandler.expects(once()).method("execute").with(eq("|verifyTable|foo.1.2|bla|"));
        WikiCommandGenerator commandGenerator = new WikiCommandGenerator((CommandExecutor) commandHandler.proxy());
        Browser browser = (Browser) commandGenerator.proxy(Browser.class);
        browser.verifyTable("foo", 1, 2, "bla");
    }
}
