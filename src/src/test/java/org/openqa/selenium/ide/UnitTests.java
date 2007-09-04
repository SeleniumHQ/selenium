package org.openqa.selenium.ide;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import junit.framework.TestCase;

import org.mortbay.http.HttpException;
import org.mortbay.http.HttpRequest;
import org.mortbay.http.HttpResponse;
import org.openqa.selenium.server.ProxyHandler;
import org.openqa.selenium.server.SeleniumServer;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class UnitTests extends TestCase {
	private static final String TEST_URL = "chrome://selenium-ide/content/jsunit/testRunner.html?testPage=selenium-ide/content/tests/unit/TestSuite.html" +
		"&autoRun=true&submitresults=http://localhost:" + SeleniumServer.getDefaultPort() + "/jsunit/acceptor";
	private static final String PROFILE_TEMPLATE_DIR = "target/profile-template";

	private SeleniumServer seleniumServer;
	private Selenium selenium;
	private List<String> testResults;

	@SuppressWarnings("serial")
    @Override
	protected void setUp() throws Exception {
        SeleniumServer.setFirefoxProfileTemplate(new File(PROFILE_TEMPLATE_DIR));
        SeleniumServer.setCustomProxyHandler(new ProxyHandler() {
            @SuppressWarnings("unchecked")
            @Override
            public void handle(String pathInContext, String pathParams, HttpRequest request, HttpResponse response) throws HttpException, IOException {
                if ("/jsunit/acceptor".equals(pathInContext)) {
                    testResults = request.getParameterValues("testCases");
                    response.setContentType("text/plain");
                    response.getOutputStream().write("OK".getBytes());
                    synchronized (UnitTests.this) {
                        UnitTests.this.notifyAll();
                    }
                } else {
                    super.handle(pathInContext, pathParams, request, response);
                }
            }
        });
        seleniumServer = new SeleniumServer(SeleniumServer.getDefaultPort(), false, true); // multiWindow
        seleniumServer.start();
        selenium = new DefaultSelenium("localhost", SeleniumServer.getDefaultPort(), "*chrome", "http://localhost/");
        selenium.start();
	}
	
	@Override
	protected void tearDown() throws Exception {
        selenium.stop();
        seleniumServer.stop();
	}
	
	public void testUnit() throws Exception {
		selenium.open(TEST_URL);
		synchronized (this) {
		    while (testResults == null) {
		        wait();
		    }
		}
        StringBuilder failedTests = new StringBuilder();
        Pattern pattern = Pattern.compile("(.*?)\\|([\\d\\.]+)\\|(\\w)\\|([\\s\\S]*)");
        for (String result : testResults) {
            Matcher m = pattern.matcher(result);
            if (m.matches()) {
                String code = m.group(3);
                if (!"S".equals(code)) {
                    failedTests.append(result).append("\n");
                }
            } else {
                fail("unrecognized result pattern: " + result);
            }
        }
        if (failedTests.length() > 0) {
            fail("Some tests failed!\n" + failedTests);
        }
	}
}
