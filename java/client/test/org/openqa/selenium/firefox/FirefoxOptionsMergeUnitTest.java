package org.openqa.selenium.firefox;

import org.junit.Test;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertTrue;
import static org.testng.AssertJUnit.assertEquals;

public class FirefoxOptionsMergeUnitTest {
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

		assertTrue("Options should contain the first argument", args.contains("--argument1"));
		assertTrue("Options should contain the second argument", args.contains("--argument2"));
		assertTrue("Options should contain the third argument", args.contains("--argument3"));
		assertEquals("Options should contain three elements", args.size(), 3);
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

		assertTrue("Option should contain boolean preference 'booleanPref1'", booleanPrefsList.containsKey("booleanPref1"));
		assertTrue("Option should contain boolean preference 'booleanPref2'", booleanPrefsList.containsKey("booleanPref2"));
		assertTrue("Option should contain boolean preference 'booleanPref3'", booleanPrefsList.containsKey("booleanPref3"));
		assertTrue("Option should contain 3 boolean preferences", booleanPrefsList.size() == 3);
	}

	@Test(expected = IllegalArgumentException.class)
	public void canNotMergeBooleanPreferences() {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options1.addPreference("booleanPref1", true);
		options1.addPreference("booleanPref2", true);

		options2.addPreference("booleanPref2", false);
		options2.addPreference("booleanPref3", true);

		options1.merge(options2);
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

		assertTrue("Option should contain int preference 'intPref1'", intPrefsList.containsKey("intPref1"));
		assertTrue("Option should contain int preference 'intPref2'", intPrefsList.containsKey("intPref2"));
		assertTrue("Option should contain int preference 'intPref3'", intPrefsList.containsKey("intPref3"));
		assertTrue("Option should contain 3 int preferences", intPrefsList.size() == 3);
	}

	@Test(expected = IllegalArgumentException.class)
	public void canNotMergeIntPreferences() {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options1.addPreference("intPref1", 1);
		options1.addPreference("intPref2", 2);

		options2.addPreference("intPref2", 1);
		options2.addPreference("intPref3", 3);

		options1.merge(options2);
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

		assertTrue("Option should contain string preference 'stringPref1'", stringPrefsList.containsKey("stringPref1"));
		assertTrue("Option should contain string preference 'stringPref1'", stringPrefsList.containsKey("stringPref1"));
		assertTrue("Option should contain string preference 'stringPref1'", stringPrefsList.containsKey("stringPref1"));
		assertTrue("Option should contain 3 string preferences", stringPrefsList.size() == 3);
	}

	@Test(expected = IllegalArgumentException.class)
	public void canNotMergeStringPreferences() throws NoSuchFieldException, IllegalAccessException {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options1.addPreference("stringPref1", "s1");
		options1.addPreference("stringPref2", "s2");

		options2.addPreference("stringPref2", "s1");
		options2.addPreference("stringPref3", "s3");

		options1.merge(options2);
	}

	@Test
	public void canMergeLogLevels() throws NoSuchFieldException, IllegalAccessException {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options2.setLogLevel(FirefoxDriverLogLevel.INFO);

		options1.merge(options2);

		Field LogLevelField =FirefoxOptions.class.getDeclaredField("logLevel");
		LogLevelField.setAccessible(true);
		FirefoxDriverLogLevel logLevel = (FirefoxDriverLogLevel) LogLevelField.get(options1);

		assertEquals("Log level should be the same", logLevel,FirefoxDriverLogLevel.INFO);
	}

	@Test(expected = IllegalArgumentException.class)
	public void canNotMergeLogLevels() {
		FirefoxOptions options1 = new FirefoxOptions();
		FirefoxOptions options2 = new FirefoxOptions();

		options1.setLogLevel(FirefoxDriverLogLevel.CONFIG);
		options2.setLogLevel(FirefoxDriverLogLevel.INFO);

		options1.merge(options2);
	}
}
