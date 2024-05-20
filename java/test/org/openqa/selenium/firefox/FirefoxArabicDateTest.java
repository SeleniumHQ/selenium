// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.firefox;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import java.util.Locale;

import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.junit.jupiter.api.Test;

public class FirefoxArabicDateTest extends JupiterTestBase {

    @Test
    @NoDriverBeforeTest
    void shouldLaunchSuccessfullyWithArabicDate() {
        Locale arabicLocal = new Locale("ar", "EG");
        Locale.setDefault(arabicLocal);

        int port = PortProber.findFreePort();
        GeckoDriverService.Builder builder = new GeckoDriverService.Builder();
        builder.usingPort(port);
        GeckoDriverService service = builder.build();

        localDriver = FirefoxDriver.builder().withDriverService(service).build();
        localDriver.get(pages.simpleTestPage);
        assertThat(driver.getTitle()).isEqualTo("Hello WebDriver");
        
        Locale.setDefault(Locale.US);

    }
    
}
