/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.firefox;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.is;
import org.openqa.selenium.AbstractDriverTestCase;

import java.io.File;
import java.io.IOException;

public class SaveScreenshotTest extends AbstractDriverTestCase {

    /**
     * Test the deprecated version of screenshot capturing.
     */
    public void testDeprecatedSaveScreenshot() throws IOException {
        File tempFile = File.createTempFile("formPage", ".png");
        assertThat(tempFile.length(), is(0L));
        driver.get(pages.formPage);
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
