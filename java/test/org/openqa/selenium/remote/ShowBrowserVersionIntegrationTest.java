package org.openqa.selenium.remote;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.Capabilities;
import static org.assertj.core.api.Assertions.assertThat;

public class ShowBrowserVersionIntegrationTest {
    @Test
    void showBrowserVersion() {
        // Start a real Chrome session
        WebDriver driver = new ChromeDriver();
        try {
            Capabilities caps = ((ChromeDriver) driver).getCapabilities();
            String version = caps.getBrowserVersion();
            System.out.println("Browser version: " + version);
            assertThat(version).isNotEmpty();
            assertThat(version).isNotNull();
        } finally {
            driver.quit();
        }
    }
}
