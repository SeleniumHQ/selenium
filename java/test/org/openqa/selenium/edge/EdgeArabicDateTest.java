package org.openqa.selenium.edge;

import static org.openqa.selenium.remote.Browser.EDGE;
import static org.assertj.core.api.Assertions.assertThat;

import java.text.NumberFormat;
import java.time.Duration;
import java.util.Locale;

import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.junit.jupiter.api.Test;

public class EdgeArabicDateTest extends JupiterTestBase {

    @Test
    @NoDriverBeforeTest
    void shouldLaunchSuccessfullyWithArabicDate() {
        int port = PortProber.findFreePort();
        NumberFormat arabicFormat = NumberFormat.getInstance(new Locale("ar"));
        arabicFormat.setGroupingUsed(false);
        String formattedNumber = arabicFormat.format(port);

        EdgeDriverService.Builder builder = new EdgeDriverService.Builder();
        builder.usingPort(Integer.parseInt(formattedNumber));
        EdgeDriverService service = builder.build();

        localDriver = new EdgeDriver(service);
        localDriver.get(pages.simpleTestPage);
        assertThat(localDriver.getTitle()).isEqualTo("Hello WebDriver");

    }
    
}
