package com.googlecode.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

import java.io.File;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.HashSet;
import java.util.Set;

import junit.framework.Test;
import junit.framework.TestSuite;

public class TestSuiteBuilder {
	private File baseDir;
	private Set<File> sourceDirs = new HashSet<File>();
	private Set<String> ignored = new HashSet<String>();
	private Class<? extends WebDriver> driverClass;
	private boolean keepDriver;
	private boolean includeJavascript;
	private boolean withDriver = true;
	private boolean withEnvironment = true;
	private String onlyRun;
	private String testMethodName;

	public TestSuiteBuilder() {
		String[] possiblePaths = { "common", "../common", };

		for (String potential : possiblePaths) {
			baseDir = new File(potential);
			if (baseDir.exists()) {
				break;
			}
		}

		assertThat(baseDir.exists(), is(true));

		baseDir = baseDir.getParentFile();
		exclude("all");
	}

	public TestSuiteBuilder addSourceDir(String dirName) {
		File dir = new File(baseDir, dirName + "/test/java");
		assertThat("Cannot find directory: " + dirName, dir.exists(), is(true));

		sourceDirs.add(dir);
		return this;
	}

	public TestSuiteBuilder usingDriver(Class<? extends WebDriver> ss) {
		this.driverClass = ss;
		return this;
	}
	
	@SuppressWarnings("unchecked")
	public TestSuiteBuilder usingDriver(String driverClassName) {
		try {
			Class<?> clazz = Class.forName(driverClassName);
			return usingDriver((Class<? extends WebDriver>) clazz);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public TestSuiteBuilder exclude(String tagToIgnore) {
		ignored.add(tagToIgnore);
		return this;
	}

	public TestSuiteBuilder keepDriverInstance() {
		keepDriver = true;

		return this;
	}

	public Test create() {
		if (withDriver)
			assertThat("No driver class set", driverClass, is(notNullValue()));

		TestSuite suite = new TestSuite();
		for (File dir : sourceDirs) {
			addTestsRecursively(suite, dir);
		}

		TestSuite toReturn = new TestSuite();
		if (withEnvironment)
			toReturn.addTest(new EnvironmentStarter(suite));
		else 
			toReturn.addTest(suite);

		return toReturn;
	}

	private void addTestsRecursively(TestSuite suite, File dir) {
		File[] files = dir.listFiles();
		for (File file : files) {
			if (file.isDirectory()) {
				addTestsRecursively(suite, file);
			} else {
				addTestsFromFile(suite, file);
			}
		}
	}

	private void addTestsFromFile(TestSuite suite, File file) {
		Class<?> clazz = getClassFrom(file);
		if (clazz == null)
			return;
		
		int modifiers = clazz.getModifiers();

		if (Modifier.isAbstract(modifiers) || !Modifier.isPublic(modifiers)) 
			return;

		if (onlyRun != null && !clazz.getName().endsWith(onlyRun))
			return;
		
		Method[] methods = clazz.getMethods();
		for (Method method : methods) {
			if (isTestMethod(method)) {
				Test test = TestSuite.createTest(clazz, method.getName());
				if (test instanceof NeedsDriver) {
					boolean freshDriver = false;
					if (method.isAnnotationPresent(NeedsFreshDriver.class)) {
						freshDriver = true;
					}

					boolean restartDriver = false;
					if (method.isAnnotationPresent(NoDriverAfterTest.class)) {
						restartDriver = true;
					}

					if (withDriver) {
						test = new DriverTestDecorator(test, driverClass,
								keepDriver, freshDriver, restartDriver);
					}
				}
				suite.addTest(test);
			}
		}
	}

	private boolean isTestMethod(Method method) {
		if (testMethodName != null)
			return method.getName().equals(testMethodName);
			
			
		if (!method.getName().startsWith("test"))
			return false;

		if (!includeJavascript
				&& method.isAnnotationPresent(JavascriptEnabled.class))
			return false;

		Ignore ignore = method.getAnnotation(Ignore.class);
		if (ignore != null) {
			for (String name : ignored) {
				if (ignore.value().contains(name)) {
					System.err.println("Ignoring: "
							+ method.getDeclaringClass() + "."
							+ method.getName() + ": " + ignore.reason());
					return false;
				}
			}
		}

		return true;
	}

	private Class<?> getClassFrom(File file) {
		String path = file.getPath().replace('\\', '/');

		if (!path.endsWith(".java"))
			return null;

		// Assume that all classes are under a "com" package
		int index = path.indexOf("/com/");
		if (index == -1)
			return null;

		path = path.substring(index + 1, path.length() - ".java".length());
		path = path.replace("/", ".");

		try {
			return Class.forName(path);
		} catch (Throwable e) {
			return null;
		}
	}

	public TestSuiteBuilder includeJavascriptTests() {
		includeJavascript = true;

		return this;
	}

	public TestSuiteBuilder usingNoDriver() {
		withDriver = false;
		
		return this;
	}

	public TestSuiteBuilder withoutEnvironment() {
		withEnvironment  = false;
		
		return this;
	}

	public TestSuiteBuilder onlyRun(String testCaseName) {
		onlyRun = "." + testCaseName;
		
		return this;
	}

	public TestSuiteBuilder method(String testMethodName) {
		this.testMethodName = testMethodName;
		
		return this;
	}
}
