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
// under the License

package org.openqa.selenium.chrome;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.io.TemporaryFilesystem;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * Unit tests for {@link ChromeOptions}.
 */

public class ChromeOptionsMergeUnitTest {

	private TemporaryFilesystem tmpFs;
	private File tempDir;
	private File firstTempFile;
	private File secondTempFile;

	@Before
	public void setUp() throws Exception {
		File baseForTest = new File(System.getProperty("java.io.tmpdir"), "tmpTest");
		baseForTest.mkdir();
		tmpFs = TemporaryFilesystem.getTmpFsBasedOn(baseForTest);
		tempDir = tmpFs.createTempDir("tempDir", "");
		firstTempFile = new File(tempDir, "firstTempFile.txt");
		secondTempFile = new File(tempDir, "secondTempFile.txt");
		writeTestFile(firstTempFile);
		writeTestFile(secondTempFile);
	}

	@After
	public void tearDown() throws Exception {
		tmpFs.deleteTemporaryFiles();
	}

	@Test
	public void canMergeBinariesEmptyReceiver() throws IllegalAccessException, NoSuchFieldException {
		ChromeOptions options1 = new ChromeOptions();
		ChromeOptions options2 = new ChromeOptions();

		options2.setBinary(secondTempFile);

		options1.merge(options2);

		Field binaryField = ChromeOptions.class.getDeclaredField("binary");
		binaryField.setAccessible(true);

		String binary1 = (String) binaryField.get(options1);
		String binary2 = (String) binaryField.get(options1);

		assertEquals("Binaries should be the same", binary1, binary2);
	}

	@Test
	public void canMergeBinariesTheSame() throws NoSuchFieldException, IllegalAccessException {
		ChromeOptions options1 = new ChromeOptions();
		ChromeOptions options2 = new ChromeOptions();

		options1.setBinary(secondTempFile);
		options2.setBinary(secondTempFile);

		options1.merge(options2);

		Field binaryField = ChromeOptions.class.getDeclaredField("binary");
		binaryField.setAccessible(true);

		String binary1 = (String) binaryField.get(options1);
		String binary2 = (String) binaryField.get(options1);

		assertEquals("Binaries should be the same", binary1, binary2);
	}

	@Test(expected = IllegalArgumentException.class)
	public void canNotMergeBinaries() {
		ChromeOptions options1 = new ChromeOptions();
		ChromeOptions options2 = new ChromeOptions();

		options1.setBinary(firstTempFile);
		options2.setBinary(secondTempFile);

		options1.merge(options2);
	}

	@Test
	public void canMergeArguments() throws NoSuchFieldException, IllegalAccessException {
		ChromeOptions options1 = new ChromeOptions();
		ChromeOptions options2 = new ChromeOptions();

		options1.addArguments("--argument1");
		options1.addArguments("--argument2");

		options2.addArguments("--argument2");
		options2.addArguments("--argument3");

		options1.merge(options2);

		Field argsField = ChromeOptions.class.getDeclaredField("args");
		argsField.setAccessible(true);

		List<String> args = (List<String>) argsField.get(options1);

		assertTrue("Options should contain the first argument", args.contains("--argument1"));
		assertTrue("Options should contain the second argument", args.contains("--argument2"));
		assertTrue("Options should contain the third argument", args.contains("--argument3"));
		assertEquals("Options should contain three elements", args.size(), 3);
	}

	@Test
	public void canMergeExtensionFiles() throws NoSuchFieldException, IllegalAccessException {
		ChromeOptions options1 = new ChromeOptions();
		ChromeOptions options2 = new ChromeOptions();

		options1.addExtensions(firstTempFile);
		options2.addExtensions(secondTempFile);

		options1.merge(options2);

		Field extensionFilesField = ChromeOptions.class.getDeclaredField("extensionFiles");
		extensionFilesField.setAccessible(true);
		List<File> extensionFilesList1 = (List<File>) extensionFilesField.get(options1);

		assertTrue("Result list should contain the first extension file", extensionFilesList1.contains(firstTempFile));
		assertTrue("Result list contain the second extension file", extensionFilesList1.contains(secondTempFile));
		assertEquals("Result list should contain two elements", extensionFilesList1.size(), 2);
	}

	@Test
	public void canMergeExtensions() throws IllegalAccessException, NoSuchFieldException {
		ChromeOptions options1 = new ChromeOptions();
		ChromeOptions options2 = new ChromeOptions();

		options1.addEncodedExtensions("First encoded extension");
		options1.addEncodedExtensions("Second encoded extension");

		options2.addEncodedExtensions("Second encoded extension");
		options2.addEncodedExtensions("Third encoded extension");

		options1.merge(options2);

		Field extensionsField = ChromeOptions.class.getDeclaredField("extensions");
		extensionsField.setAccessible(true);
		List<File> extensionFilesList1 = (List<File>) extensionsField.get(options1);

		assertTrue("List should contain the first extension", extensionFilesList1.contains("First encoded extension"));
		assertTrue("List should contain the second extension", extensionFilesList1.contains("Second encoded extension"));
		assertTrue("List should contain the third extension", extensionFilesList1.contains("Third encoded extension"));
		assertEquals("List should contain three elements", extensionFilesList1.size(), 3);
	}

	@Test
	public void canMergeExperimentalOptions() throws NoSuchFieldException, IllegalAccessException {
		ChromeOptions options1 = new ChromeOptions();
		ChromeOptions options2 = new ChromeOptions();

		Map<String, Object> prefs = new HashMap<String, Object>();
		prefs.put("profile.default_content_settings.popups", 0);

		options2.setExperimentalOption("prefs1", prefs);
		options2.setExperimentalOption("prefs2", prefs);

		options1.setExperimentalOption("prefs2", prefs);
		options1.setExperimentalOption("prefs3", prefs);

		options1.merge(options2);

		Field experimentalOptionsField = ChromeOptions.class.getDeclaredField("experimentalOptions");
		experimentalOptionsField.setAccessible(true);
		Map<String, Object> experimentalOptionsList1 = (Map<String, Object>) experimentalOptionsField.get(options1);

		assertTrue("Map should contain experimental option 'perfs1'", experimentalOptionsList1.get("prefs1") != null);
		assertTrue("Map should contain experimental option 'perfs2'", experimentalOptionsList1.get("prefs2") != null);
		assertTrue("Map should contain experimental option 'perfs3'", experimentalOptionsList1.get("prefs3") != null);
		assertEquals("Map should contain three elements", experimentalOptionsList1.size(), 3);
	}

	@Test(expected = IllegalArgumentException.class)
	public void canNotMergeExperimentalOptions() throws NoSuchFieldException, IllegalAccessException {
		ChromeOptions options1 = new ChromeOptions();
		ChromeOptions options2 = new ChromeOptions();

		Map<String, Object> prefs = new HashMap<String, Object>();
		prefs.put("profile.default_content_settings.popups", 0);

		Map<String, Object> prefs1 = new HashMap<String, Object>();
		prefs1.put("profile.default_content_settings.popups", 1);

		options2.setExperimentalOption("prefs1", prefs);
		options2.setExperimentalOption("prefs2", prefs);

		options1.setExperimentalOption("prefs2", prefs1);

		options1.merge(options2);
	}

	private void writeTestFile(File file) throws IOException {
		File parent = file.getParentFile();
		if (!parent.exists()) {
			assertTrue(parent.mkdirs());
		}
		byte[] byteArray = new byte[16];
		new Random().nextBytes(byteArray);
		try (OutputStream out = new FileOutputStream(file)) {
			out.write(byteArray);
		}
		file.deleteOnExit();
	}
}