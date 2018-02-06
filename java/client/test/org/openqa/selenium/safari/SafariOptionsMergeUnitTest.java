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

package org.openqa.selenium.safari;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.opera.OperaOptions;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class SafariOptionsMergeUnitTest {
	@Test
	public void canMergeOptions() throws IllegalAccessException, NoSuchFieldException {
		SafariOptions options1 = new SafariOptions();
		SafariOptions options2 = new SafariOptions(
				new ImmutableCapabilities("cleanSession", false, "technologyPreview", false));

		options1.merge(options2);

		Field optionsField = SafariOptions.class.getDeclaredField("options");
		optionsField.setAccessible(true);
		Map <?, ?> optionsValue = (Map <?, ?>) optionsField.get(options1);

		assertEquals("Clear session option should be false", optionsValue.get("cleanSession"), false);
		assertEquals("Technology preview option should be false", optionsValue.get("technologyPreview"), false);
	}
}
