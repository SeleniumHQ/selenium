package com.thoughtworks.selenium;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
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
