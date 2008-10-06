package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNot.not;

import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;

import junit.framework.TestCase;

public class AbstractDriverTestCase extends TestCase implements NeedsDriver {
	protected WebDriver driver;
	protected String simpleTestPage;
	protected String xhtmlTestPage;
	protected String formPage;
	protected String metaRedirectPage;
	protected String redirectPage;
	protected String javascriptPage;
	protected String framesetPage;
	protected String iframePage;
	protected String dragAndDropPage;
	protected String chinesePage;
	protected String nestedPage;
	
	public void setDriver(WebDriver driver) {
		this.driver = driver;
	}
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		
        driver.setVisible(true);

        TestEnvironment environment = GlobalTestEnvironment.get();

        AppServer appServer = environment.getAppServer();
        simpleTestPage = appServer.whereIs("simpleTest.html");
        xhtmlTestPage = appServer.whereIs("xhtmlTest.html");
        formPage = appServer.whereIs("formPage.html");
        metaRedirectPage = appServer.whereIs("meta-redirect.html");
        redirectPage = appServer.whereIs("redirect");
        javascriptPage = appServer.whereIs("javascriptPage.html");
        framesetPage = appServer.whereIs("frameset.html");
        iframePage = appServer.whereIs("iframes.html");
        dragAndDropPage = appServer.whereIs("dragAndDropTest.html");
        chinesePage = appServer.whereIs("cn-test.html");
        nestedPage = appServer.whereIs("nestedElements.html");
        
        String hostName = environment.getAppServer().getHostName();
        String alternateHostName = environment.getAppServer().getAlternateHostName();

        assertThat(hostName, is(not(equalTo(alternateHostName))));
	}
}
