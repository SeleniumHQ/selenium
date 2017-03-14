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

package org.openqa.selenium.edge;

import static com.google.common.base.Preconditions.checkNotNull;

import com.google.gson.JsonObject;

import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.IOException;


/**
 * Class to manage options specific to {@link EdgeDriver}.
 *
 * <p>Example usage:
 * <pre><code>
 * EdgeOptions options = new EdgeOptions()

 *
 * // For use with ChromeDriver:
 * EdgeDriver driver = new EdgeDriver(options);
 *
 * // or alternatively:
 * DesiredCapabilities capabilities = DesiredCapabilities.edge();
 * capabilities.setCapability(EdgeOptions.CAPABILITY, options);
 * EdgeDriver driver = new EdgeDriver(capabilities);
 *
 * // For use with RemoteWebDriver:
 * DesiredCapabilities capabilities = DesiredCapabilities.edge();
 * capabilities.setCapability(EdgeOptions.CAPABILITY, options);
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/wd/hub"), capabilities);
 * </code></pre>
 */
public class EdgeOptions {

    /**
     * Key used to store a set of EdgeOptions in a {@link DesiredCapabilities}
	 * object.
	 */
	public static final String CAPABILITY = "edgeOptions";

	private String pageLoadStrategy;

	/**
	 * Sets the page load strategy for  Edge
	 *
	 * Supported values are "normal", "eager" and "none"
   *
   * @param strategy strategy for page load: normal, eager or none
	 */
	public void setPageLoadStrategy(String strategy) {
      this.pageLoadStrategy = checkNotNull(strategy);
	}

	/**
	 * Converts this instance to its JSON representation.
	 *
	 * @return The JSON representation of the options.
	 * @throws IOException If an error occurred while reading the Edge extension files.
	 */
	public JsonObject toJson() throws IOException {
	  JsonObject options = new JsonObject();
	  if (this.pageLoadStrategy != null) {
		  options.addProperty(CapabilityType.PAGE_LOAD_STRATEGY, this.pageLoadStrategy);
	  }

	  return options;
	}

    /**
     * Returns DesiredCapabilities for Edge with these options included as
     * capabilities. This does not copy the options. Further changes will be
     * reflected in the returned capabilities.
     *
     * @return DesiredCapabilities for Edge with these options.
     */
    DesiredCapabilities toCapabilities() {
      DesiredCapabilities capabilities = DesiredCapabilities.edge();
	  if (this.pageLoadStrategy != null) {
          capabilities.setCapability(CapabilityType.PAGE_LOAD_STRATEGY, this.pageLoadStrategy);
	  }

      return capabilities;
    }
}
