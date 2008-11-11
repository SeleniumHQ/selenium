package org.openqa.selenium.firefox;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.greaterThan;

import java.io.File;
import java.io.IOException;
import org.openqa.selenium.AbstractDriverTestCase;

public class SaveScreenshotTest extends AbstractDriverTestCase {

    public void testSaveScreenshot() throws IOException {
        File tempFile = File.createTempFile("formPage", ".png");
        assertThat(tempFile.length(), is(0L));
        driver.get(formPage);
        try {
            ((FirefoxDriver) driver).saveScreenshot(tempFile);
            assertThat(tempFile.length(), is(greaterThan(0L)));
        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

}
