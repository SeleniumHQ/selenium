/*Licensed to the Software Freedom Conservancy (SFC) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The SFC licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

package org.openqa.selenium.safari;


import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.DesiredCapabilities;

public class SafariOptionsTest {

  @Test
  public void givenDesiredCaps_whenAddSafariOptions_thenTheyAreCombinedWithOriginal() {
    SafariOptions safariOptions = new SafariOptions();
    Capabilities combined = safariOptions.addTo(generateInitialCaps());
    assertThat(combined.getCapability(SafariOptions.CAPABILITY), equalTo(safariOptions));
    assertThat(combined.getCapability("jedi"), equalTo("obi'wan"));
    assertThat(combined.getCapability("ent"), equalTo("treebeard"));
    assertThat(combined.getCapability("cat"), equalTo("sophia"));
  }

  private DesiredCapabilities generateInitialCaps() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability("jedi", "obi'wan");
    caps.setCapability("ent", "treebeard");
    caps.setCapability("cat", "sophia");
    return caps;
  }
}
