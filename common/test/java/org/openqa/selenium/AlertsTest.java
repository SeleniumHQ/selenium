package org.openqa.selenium;

import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.GlobalTestEnvironment;

public class AlertsTest extends AbstractDriverTestCase {
    private String alertPage;

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        TestEnvironment environment = GlobalTestEnvironment.get();
        alertPage = environment.getAppServer().whereIs("alerts.html");
    }

    @JavascriptEnabled
    @Ignore("safari, ie")
    public void testShouldBeAbleToOverrideTheWindowAlertMethod() {
        driver.get(alertPage);

        ((JavascriptExecutor) driver).executeScript("window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
        driver.findElement(By.id("alert")).click();
    }
}
