package org.openqa.selenium.firefox;

import com.google.common.collect.ImmutableMap;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.openqa.selenium.MutableCapabilities;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertEquals;

public class FirefoxOptionsMergeUnitTest {
	@Rule
	public TemporaryFolder testFolder = new TemporaryFolder();

	@Test
	public void canMergeArguments() throws NoSuchFieldException, IllegalAccessException {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options1.addArguments("--argument1");
		options1.addArguments("--argument2");

		options2.addArguments("--argument2");
		options2.addArguments("--argument3");

		options1.merge(options2);

		Field argsField = FirefoxOptions.class.getDeclaredField("args");
		argsField.setAccessible(true);

		List<String> args = (List<String>) argsField.get(options1);

		assertTrue("Option #1 should contain the first argument", args.contains("--argument1"));
		assertTrue("Option #1 should contain the second argument", args.contains("--argument2"));
		assertTrue("Option #1 should contain the third argument", args.contains("--argument3"));
		assertEquals("Option #1 should contain three elements", args.size(), 3);
	}

	@Test
	public void canMergeBinaries() throws NoSuchFieldException, IllegalAccessException, IOException {
		File firstTempFile = testFolder.newFile("firstTempFile.txt");
		File secondTempFile = testFolder.newFile("secondTempFile.txt");

		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();


		options1.setBinary(firstTempFile.getAbsolutePath());
		options2.setBinary(secondTempFile.getAbsolutePath());

		options1.merge(options2);

		Field binaryField = FirefoxOptions.class.getDeclaredField("binary");
		binaryField.setAccessible(true);

		assertEquals("Binaries should be the same", binaryField.get(options1), binaryField.get(options1));

		firstTempFile.delete();
		secondTempFile.delete();
	}

	@Test
	public void canMergeLegacy() throws NoSuchFieldException, IllegalAccessException {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options1.setLegacy(true);
		options2.setLegacy(false);

		options1.merge(options2);

		Field argsField = FirefoxOptions.class.getDeclaredField("legacy");
		argsField.setAccessible(true);

		boolean legacy = (boolean) argsField.get(options1);

		assertFalse("Option #1 should have false legacy", legacy);
	}

	@Test
	public void canMergeBooleanPreferences() throws NoSuchFieldException, IllegalAccessException {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options1.addPreference("booleanPref1", true);
		options1.addPreference("booleanPref2", true);

		options2.addPreference("booleanPref2", true);
		options2.addPreference("booleanPref3", true);

		options1.merge(options2);

		Field booleanPrefsField =FirefoxOptions.class.getDeclaredField("booleanPrefs");
		booleanPrefsField.setAccessible(true);
		Map<String, Boolean> booleanPrefsList = (Map<String, Boolean>) booleanPrefsField.get(options1);

		assertTrue("Option #1 should contain boolean preference 'booleanPref1'", booleanPrefsList.containsKey("booleanPref1"));
		assertTrue("Option #1 should contain boolean preference 'booleanPref2'", booleanPrefsList.containsKey("booleanPref2"));
		assertTrue("Option #1 should contain boolean preference 'booleanPref3'", booleanPrefsList.containsKey("booleanPref3"));
		assertTrue("Option #1 should contain 3 boolean preferences", booleanPrefsList.size() == 3);
	}

	@Test
	public void canMergeIntPreferences() throws NoSuchFieldException, IllegalAccessException {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options1.addPreference("intPref1", 1);
		options1.addPreference("intPref2", 2);

		options2.addPreference("intPref2", 2);
		options2.addPreference("intPref3", 3);

		options1.merge(options2);

		Field intPrefsField =FirefoxOptions.class.getDeclaredField("intPrefs");
		intPrefsField.setAccessible(true);
		Map<String, Integer> intPrefsList = (Map<String, Integer>) intPrefsField.get(options1);

		assertTrue("Option #1 should contain int preference 'intPref1'", intPrefsList.containsKey("intPref1"));
		assertTrue("Option #1 should contain int preference 'intPref2'", intPrefsList.containsKey("intPref2"));
		assertTrue("Option #1 should contain int preference 'intPref3'", intPrefsList.containsKey("intPref3"));
		assertTrue("Option #1 should contain 3 int preferences", intPrefsList.size() == 3);
	}

	@Test
	public void canMergeStringPreferences() throws NoSuchFieldException, IllegalAccessException {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options1.addPreference("stringPref1", "s1");
		options1.addPreference("stringPref2", "s2");

		options2.addPreference("stringPref2", "s2");
		options2.addPreference("stringPref3", "s3");

		options1.merge(options2);

		Field stringPrefsField =FirefoxOptions.class.getDeclaredField("stringPrefs");
		stringPrefsField.setAccessible(true);
		Map<String, String> stringPrefsList = (Map<String, String>) stringPrefsField.get(options1);

		assertTrue("Option #1 should contain string preference 'stringPref1'", stringPrefsList.containsKey("stringPref1"));
		assertTrue("Option #1 should contain string preference 'stringPref1'", stringPrefsList.containsKey("stringPref1"));
		assertTrue("Option #1 should contain string preference 'stringPref1'", stringPrefsList.containsKey("stringPref1"));
		assertTrue("Option #1 should contain 3 string preferences", stringPrefsList.size() == 3);
	}

	@Test
	public void canMergeLogLevels() throws NoSuchFieldException, IllegalAccessException {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options2.setLogLevel(FirefoxDriverLogLevel.INFO);

		options1.merge(options2);

		Field logLevelField = FirefoxOptions.class.getDeclaredField("logLevel");
		logLevelField.setAccessible(true);
		FirefoxDriverLogLevel logLevel = (FirefoxDriverLogLevel) logLevelField.get(options1);

		assertEquals("Log level should be the same", logLevel,FirefoxDriverLogLevel.INFO);
	}
}
