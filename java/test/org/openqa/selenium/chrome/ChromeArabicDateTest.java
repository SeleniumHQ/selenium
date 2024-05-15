package org.openqa.selenium.chrome;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;

import java.text.NumberFormat;
import java.time.Duration;
import java.util.Locale;

import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.http.ClientConfig;

public class ChromeArabicDateTest extends JupiterTestBase {
    
    @Test
    @NoDriverBeforeTest
    void shouldLaunchSuccessfullyWithArabicDate() {
        int port = PortProber.findFreePort();
        NumberFormat arabicFormat = NumberFormat.getInstance(new Locale("ar"));
        arabicFormat.setGroupingUsed(false);
        String formattedNumber = arabicFormat.format(port);

        ChromeDriverService.Builder builder = new ChromeDriverService.Builder();
        builder.usingPort(Integer.parseInt(formattedNumber));
        ChromeDriverService service = builder.build();
        
        localDriver = new ChromeDriver(service);
        localDriver.get(pages.simpleTestPage);
        assertThat(localDriver.getTitle()).isEqualTo("Hello WebDriver");
    }
}
