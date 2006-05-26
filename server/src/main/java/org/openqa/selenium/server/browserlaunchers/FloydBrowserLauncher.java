package org.openqa.selenium.server.browserlaunchers;

import floyd.Browser;
import floyd.events.BeforePageLoadedEvent;
import floyd.events.BeforePageLoadedListener;
import org.openqa.selenium.server.SeleneseCommand;
import org.openqa.selenium.server.SeleneseQueue;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public abstract class FloydBrowserLauncher implements BrowserLauncher, SeleneseQueueAware {
    private Browser browser;
    private SeleneseQueue queue;

    protected FloydBrowserLauncher(Browser browser) {
        this.browser = browser;
    }

    private void start() {
        browser.addBeforePageLoadedListener(new BeforePageLoadedListener() {
            public void onBeforePageLoaded(BeforePageLoadedEvent beforePageLoadedEvent) {
                try {
                    Browser browser = beforePageLoadedEvent.getBrowser();
                    loadScript(browser, "core/scripts/xmlextras.js");
                    loadScript(browser, "core/scripts/selenium-browserdetect.js");
                    loadScript(browser, "core/scripts/selenium-browserbot.js");
                    loadScript(browser, "core/scripts/selenium-api.js");
                    loadScript(browser, "core/scripts/selenium-commandhandlers.js");
                    loadScript(browser, "core/scripts/selenium-executionloop.js");
                    loadScript(browser, "core/scripts/selenium-logging.js");
                    loadScript(browser, "core/scripts/htmlutils.js");
                    loadScript(browser, "core/xpath/misc.js");
                    loadScript(browser, "core/xpath/dom.js");
                    loadScript(browser, "core/xpath/xpath.js");

                    browser.executeJavascript("BrowserBot.prototype.getContentWindow = function() {\n" +
                            "    return this.getFrame().contentWindow || frames[this.getFrame().id] || this.getFrame();\n" +
                            "};");
                    browser.executeJavascript("var commandFactory;\n" +
                            "var selenium;\n" +
                            "\n" +
                            "function runTest() {\n" +
                            "    commandFactory = new CommandHandlerFactory();\n" +
                            "    selenium = Selenium.createForFrame(window);\n" +
                            "    commandFactory.registerAll(selenium);\n" +
                            "}\n" +
                            "\n" +
                            "function exec(c, t, v) {\n" +
                            "    var command = [];\n" +
                            "    command.command = c;\n" +
                            "    command.target = t;\n" +
                            "    command.value = v;\n" +
                            "    LOG.info(\"Executing: |\" + command.command + \" | \" + command.target + \" | \" + command.value + \" |\");\n" +
                            "    var handler = commandFactory.getCommandHandler(command.command);\n" +
                            "    if (handler == null) {\n" +
                            "        throw new SeleniumError(\"Unknown command: '\" + command.command + \"'\");\n" +
                            "    }\n" +
                            "    command.target = selenium.preprocessParameter(command.target);\n" +
                            "    command.value = selenium.preprocessParameter(command.value);\n" +
                            "    LOG.debug(\"Command found, going to execute \" + command.command);\n" +
                            "    var result = handler.execute(selenium, command);\n" +
                            "    LOG.debug(\"Command complete\");\n" +
                            "    return result;\n" +
                            "};");
                    browser.executeJavascript("runTest();");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            private void loadScript(Browser browser, String path) throws IOException {
                InputStream is = getClass().getClassLoader().getResourceAsStream(path);
                String s = new String(read(is));
                browser.executeJavascript(s);
            }

            public byte[] read(InputStream is) throws IOException {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[2048];
                int length;
                while ((length = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, length);
                }

                return baos.toByteArray();
            }
        });

        browser.start();
    }

    protected abstract String parseResult(Object o);

    private void runTests() {
        Runnable runnable = new Runnable() {
            public void run() {
                String result = null;
                while (!"END".equals(result)) {
                    SeleneseCommand cmd = queue.handleCommandResult(result);

                    if ("waitForPageToLoad".equals(cmd.getCommand())) {
                        browser.waitForLoadCompletion();
                        result = "OK";
                    } else if ("open".equals(cmd.getCommand())) {
                        browser.loadURIAndWaitForCompletion(cmd.getField());
                        result = "OK";
                    } else {
                        // do the command
                        Object o = browser.executeJavascript("exec('" + cmd.getCommand() + "','" +
                                cmd.getField() + "','" +
                                cmd.getValue() + "')");

                        // set the result
                        result = parseResult(o);

                        if (cmd.getCommand().endsWith("AndWait")) {
                            browser.waitForLoadCompletion();
                        }
                    }
                }
            }
        };
        new Thread(runnable).start();
    }

    public void launchRemoteSession(String url) {
        start();
        browser.loadURIAndWaitForCompletion(url);
        runTests();
    }

    public void launchHTMLSuite(String startURL, String suiteUrl) {
        start();
        runTests();
    }

    public void close() {
        browser.close();
        browser.destroy();
    }

    public void setSeleneseQueue(SeleneseQueue queue) {
        this.queue = queue;
    }
}
