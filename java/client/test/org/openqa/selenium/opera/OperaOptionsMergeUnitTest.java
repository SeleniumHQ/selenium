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

package org.openqa.selenium.opera;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class OperaOptionsMergeUnitTest {
	@Rule
	public TemporaryFolder testFolder = new TemporaryFolder();

	@Test
	public void canMergeBinaries() throws IOException, NoSuchFieldException, IllegalAccessException {
		OperaOptions options1 = new OperaOptions();
		OperaOptions options2 = new OperaOptions();

		Path fakeBinary = Files.createTempFile("fake", "binary");

		options2.setBinary(fakeBinary.toString());

		options1.merge(options2);

		Field binaryField = OperaOptions.class.getDeclaredField("binary");
		binaryField.setAccessible(true);
		String binaryValue = (String) binaryField.get(options1);

		assertEquals("Binaries should be the same", binaryValue, fakeBinary.toString());

		if (new File(fakeBinary.toString()).exists()) {
			new File(fakeBinary.toString()).delete();
		}
	}

	@Test
	public void canMergeExperimentalOptions() throws NoSuchFieldException, IllegalAccessException {
		OperaOptions options1 = new OperaOptions();
		OperaOptions options2 = new OperaOptions();

		Map<String, Object> prefs = new HashMap<String, Object>();
		prefs.put("profile.default_content_settings.popups", 0);

		options2.setExperimentalOption("prefs1", prefs);
		options2.setExperimentalOption("prefs2", prefs);

		options1.setExperimentalOption("prefs2", prefs);
		options1.setExperimentalOption("prefs3", prefs);

		options1.merge(options2);

		Field experimentalOptionsField = OperaOptions.class.getDeclaredField("experimentalOptions");
		experimentalOptionsField.setAccessible(true);
		Map<String, Object> experimentalOptionsList1 = (Map<String, Object>) experimentalOptionsField.get(options1);

		assertTrue("Map should contain experimental option 'perfs1'", experimentalOptionsList1.get("prefs1") != null);
		assertTrue("Map should contain experimental option 'perfs2'", experimentalOptionsList1.get("prefs2") != null);
		assertTrue("Map should contain experimental option 'perfs3'", experimentalOptionsList1.get("prefs3") != null);
		assertEquals("Map should contain three elements", experimentalOptionsList1.size(), 3);
	}

	@Test
	public void canMergeArguments() throws NoSuchFieldException, IllegalAccessException {
		OperaOptions options1 = new OperaOptions();
		OperaOptions options2 = new OperaOptions();

		options1.addArguments("--argument1");
		options1.addArguments("--argument2");

		options2.addArguments("--argument2");
		options2.addArguments("--argument3");

		options1.merge(options2);

		Field argsField = OperaOptions.class.getDeclaredField("args");
		argsField.setAccessible(true);

		List<String> args = (List<String>) argsField.get(options1);

		assertTrue("Option #1 should contain the first argument", args.contains("--argument1"));
		assertTrue("Option #1 should contain the second argument", args.contains("--argument2"));
		assertTrue("Option #1 should contain the third argument", args.contains("--argument3"));
		assertEquals("Option #1 should contain three elements", args.size(), 3);
	}

	@Test
	public void canMergeExtensionFiles() throws NoSuchFieldException, IllegalAccessException, IOException {
		File firstTempFile = testFolder.newFile("firstTempFile.txt");
		File secondTempFile = testFolder.newFile("secondTempFile.txt");

		OperaOptions options1 = new OperaOptions();
		OperaOptions options2 = new OperaOptions();

		options1.addExtensions(firstTempFile);
		options2.addExtensions(secondTempFile);

		options1.merge(options2);

		Field extensionFilesField = OperaOptions.class.getDeclaredField("extensionFiles");
		extensionFilesField.setAccessible(true);
		List<File> extensionFilesList1 = (List<File>) extensionFilesField.get(options1);

		assertTrue("Result list should contain the first extension file", extensionFilesList1.contains(firstTempFile));
		assertTrue("Result list contain the second extension file", extensionFilesList1.contains(secondTempFile));
		assertEquals("Result list should contain two elements", extensionFilesList1.size(), 2);

		firstTempFile.delete();
		secondTempFile.delete();
	}

	@Test
	public void canMergeExtensions() throws IllegalAccessException, NoSuchFieldException {
		OperaOptions options1 = new OperaOptions();
		OperaOptions options2 = new OperaOptions();

		options1.addEncodedExtensions("First encoded extension");
		options1.addEncodedExtensions("Second encoded extension");

		options2.addEncodedExtensions("Second encoded extension");
		options2.addEncodedExtensions("Third encoded extension");

		options1.merge(options2);

		Field extensionsField = OperaOptions.class.getDeclaredField("extensions");
		extensionsField.setAccessible(true);
		List<File> extensionFilesList1 = (List<File>) extensionsField.get(options1);

		assertTrue("List should contain the first extension", extensionFilesList1.contains("First encoded extension"));
		assertTrue("List should contain the second extension", extensionFilesList1.contains("Second encoded extension"));
		assertTrue("List should contain the third extension", extensionFilesList1.contains("Third encoded extension"));
		assertEquals("List should contain three elements", extensionFilesList1.size(), 3);
	}
}
