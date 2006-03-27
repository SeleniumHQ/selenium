// This file has been automatically generated via XSL
package com.thoughtworks.selenium;

public class DefaultSelenium implements Selenium {

    private CommandProcessor commandProcessor;
    /** Uses a CommandBridgeClient, specifying a server host/port, a command to launch the browser, and a starting URL for the browser.
     * 
     * &lt;p&gt;&lt;i&gt;browserString&lt;/i&gt; may be any one of the following:
     * &lt;ul&gt;
     * &lt;li&gt;&lt;code&gt;*firefox [absolute path]&lt;/code&gt; - Automatically launch a new Firefox process using a custom Firefox profile.
     * This profile will be automatically configured to use the Selenium Server as a proxy and to have all annoying prompts
     * ("save your password?" "forms are insecure" "make Firefox your default browser?" disabled.  You may optionally specify
     * an absolute path to your firefox executable, or just say "*firefox".  If no absolute path is specified, we'll look for
     * firefox.exe in a default location (normally c:\program files\mozilla firefox\firefox.exe), which you can override by
     * setting the Java system property &lt;code&gt;firefoxDefaultPath&lt;/code&gt; to the correct path to Firefox.&lt;/li&gt;
     * &lt;li&gt;&lt;code&gt;*iexplore [absolute path]&lt;/code&gt; - Automatically launch a new Internet Explorer process using custom Windows registry settings.
     * This process will be automatically configured to use the Selenium Server as a proxy and to have all annoying prompts
     * ("save your password?" "forms are insecure" "make Firefox your default browser?" disabled.  You may optionally specify
     * an absolute path to your iexplore executable, or just say "*iexplore".  If no absolute path is specified, we'll look for
     * iexplore.exe in a default location (normally c:\program files\internet explorer\iexplore.exe), which you can override by
     * setting the Java system property &lt;code&gt;iexploreDefaultPath&lt;/code&gt; to the correct path to Internet Explorer.&lt;/li&gt;
     * &lt;li&gt;&lt;code&gt;/path/to/my/browser [other arguments]&lt;/code&gt; - You may also simply specify the absolute path to your browser
     * executable, or use a relative path to your executable (which we'll try to find on your path).  &lt;b&gt;Warning:&lt;/b&gt; If you
     * specify your own custom browser, it's up to you to configure it correctly.  At a minimum, you'll need to configure your
     * browser to use the Selenium Server as a proxy, and disable all browser-specific prompting.
     * &lt;/ul&gt;
     * 
     * @param serverHost the host name on which the Selenium Server resides
     * @param serverPort the port on which the Selenium Server is listening
     * @param browserString the command string used to launch the browser, e.g. "*firefox", "*iexplore" or "c:\\program files\\internet explorer\\iexplore.exe"
     * @param browserURL the starting URL including just a domain name.  We'll start the browser pointing at the Selenium resources on this URL,
     * e.g. "http://www.google.com" would send the browser to "http://www.google.com/selenium-server/SeleneseRunner.html"
     */
    public DefaultSelenium(String serverHost, int serverPort, String browserStartCommand, String browserURL) {
        this.commandProcessor = new HttpCommandProcessor(serverHost, serverPort, browserStartCommand, browserURL);
    }
    
    /** Uses an arbitrary CommandProcessor */
    public DefaultSelenium(CommandProcessor processor) {
        this.commandProcessor = processor;
    }
    
    public void start() {
        commandProcessor.start();

    }

    public void stop() {
        commandProcessor.stop();
    }

    public void click(String locator) {
        commandProcessor.doCommand("click", new String[] {locator,});
    }

    public void keyPress(String locator,String keycode) {
        commandProcessor.doCommand("keyPress", new String[] {locator,keycode,});
    }

    public void keyDown(String locator,String keycode) {
        commandProcessor.doCommand("keyDown", new String[] {locator,keycode,});
    }

    public void mouseOver(String locator) {
        commandProcessor.doCommand("mouseOver", new String[] {locator,});
    }

    public void mouseDown(String locator) {
        commandProcessor.doCommand("mouseDown", new String[] {locator,});
    }

    public void type(String locator,String value) {
        commandProcessor.doCommand("type", new String[] {locator,value,});
    }

    public void check(String locator) {
        commandProcessor.doCommand("check", new String[] {locator,});
    }

    public void uncheck(String locator) {
        commandProcessor.doCommand("uncheck", new String[] {locator,});
    }

    public void select(String locator,String optionLocator) {
        commandProcessor.doCommand("select", new String[] {locator,optionLocator,});
    }

    public void submit(String formLocator) {
        commandProcessor.doCommand("submit", new String[] {formLocator,});
    }

    public void open(String url) {
        commandProcessor.doCommand("open", new String[] {url,});
    }

    public void selectWindow(String windowID) {
        commandProcessor.doCommand("selectWindow", new String[] {windowID,});
    }

    public void chooseCancelOnNextConfirmation() {
        commandProcessor.doCommand("chooseCancelOnNextConfirmation", new String[] {});
    }

    public void answerOnNextPrompt(String answer) {
        commandProcessor.doCommand("answerOnNextPrompt", new String[] {answer,});
    }

    public void goBack() {
        commandProcessor.doCommand("goBack", new String[] {});
    }

    public void close() {
        commandProcessor.doCommand("close", new String[] {});
    }

    public void fireEvent(String locator,String event) {
        commandProcessor.doCommand("fireEvent", new String[] {locator,event,});
    }

    public String getAlert() {
        return commandProcessor.getString("getAlert", new String[] {});
    }

    public String getConfirmation() {
        return commandProcessor.getString("getConfirmation", new String[] {});
    }

    public String getPrompt() {
        return commandProcessor.getString("getPrompt", new String[] {});
    }

    public String getAbsoluteLocation() {
        return commandProcessor.getString("getAbsoluteLocation", new String[] {});
    }

    public void assertLocation(String expectedLocation) {
        commandProcessor.doCommand("assertLocation", new String[] {expectedLocation,});
    }

    public String getTitle() {
        return commandProcessor.getString("getTitle", new String[] {});
    }

    public String getBodyText() {
        return commandProcessor.getString("getBodyText", new String[] {});
    }

    public String getValue(String locator) {
        return commandProcessor.getString("getValue", new String[] {locator,});
    }

    public String getText(String locator) {
        return commandProcessor.getString("getText", new String[] {locator,});
    }

    public String getEval(String script) {
        return commandProcessor.getString("getEval", new String[] {script,});
    }

    public String getChecked(String locator) {
        return commandProcessor.getString("getChecked", new String[] {locator,});
    }

    public String getTable(String tableCellAddress) {
        return commandProcessor.getString("getTable", new String[] {tableCellAddress,});
    }

    public void assertSelected(String locator,String optionLocator) {
        commandProcessor.doCommand("assertSelected", new String[] {locator,optionLocator,});
    }

    public String[] getSelectOptions(String locator) {
        return commandProcessor.getStringArray("getSelectOptions", new String[] {locator,});
    }

    public String getAttribute(String attributeLocator) {
        return commandProcessor.getString("getAttribute", new String[] {attributeLocator,});
    }

    public void assertTextPresent(String pattern) {
        commandProcessor.doCommand("assertTextPresent", new String[] {pattern,});
    }

    public void assertTextNotPresent(String pattern) {
        commandProcessor.doCommand("assertTextNotPresent", new String[] {pattern,});
    }

    public void assertElementPresent(String locator) {
        commandProcessor.doCommand("assertElementPresent", new String[] {locator,});
    }

    public void assertElementNotPresent(String locator) {
        commandProcessor.doCommand("assertElementNotPresent", new String[] {locator,});
    }

    public void assertVisible(String locator) {
        commandProcessor.doCommand("assertVisible", new String[] {locator,});
    }

    public void assertNotVisible(String locator) {
        commandProcessor.doCommand("assertNotVisible", new String[] {locator,});
    }

    public void assertEditable(String locator) {
        commandProcessor.doCommand("assertEditable", new String[] {locator,});
    }

    public void assertNotEditable(String locator) {
        commandProcessor.doCommand("assertNotEditable", new String[] {locator,});
    }

    public String[] getAllButtons() {
        return commandProcessor.getStringArray("getAllButtons", new String[] {});
    }

    public String[] getAllLinks() {
        return commandProcessor.getStringArray("getAllLinks", new String[] {});
    }

    public String[] getAllFields() {
        return commandProcessor.getStringArray("getAllFields", new String[] {});
    }

    public void setContext(String context,String logLevelThreshold) {
        commandProcessor.doCommand("setContext", new String[] {context,logLevelThreshold,});
    }

    public String getExpression(String expression) {
        return commandProcessor.getString("getExpression", new String[] {expression,});
    }

    public void waitForCondition(String script,String timeout) {
        commandProcessor.doCommand("waitForCondition", new String[] {script,timeout,});
    }

    public void waitForPageToLoad(String timeout) {
        commandProcessor.doCommand("waitForPageToLoad", new String[] {timeout,});
    }

}