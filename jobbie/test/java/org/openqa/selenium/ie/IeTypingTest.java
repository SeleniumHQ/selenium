package org.openqa.selenium.ie;

import org.hamcrest.Matchers;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import static org.hamcrest.MatcherAssert.assertThat;

public class IeTypingTest extends AbstractDriverTestCase {
	public void testShouldFireKeyPressEvents() {
		driver.get(javascriptPage);
		
		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("a");
		
		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), Matchers.containsString("press:"));
	}
	
	public void testShouldFireKeyDownEvents() {
		driver.get(javascriptPage);
		
		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("I");
		
		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), Matchers.containsString("down:"));
	}
	
	public void testShouldFireKeyUpEvents() {
		driver.get(javascriptPage);
		
		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("a");
		
		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), Matchers.containsString("up:"));
	}
	
	public void testShouldTypeLowerCaseLetters() {
		driver.get(javascriptPage);
		
		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("abc def");
		
		assertThat(keyReporter.getValue(), Matchers.is("abc def"));
	}
	
	public void testShouldBeAbleToTypeCapitalLetters() {
		driver.get(javascriptPage);
		
		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("ABC DEF");
		
		assertThat(keyReporter.getValue(), Matchers.is("ABC DEF"));
	}
	
	public void testShouldBeAbleToTypeQuoteMarks() {
		driver.get(javascriptPage);
		
		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("\"");
		
		assertThat(keyReporter.getValue(), Matchers.is("\""));
	}
	
	public void testShouldBeAbleToMixUpperAndLowerCaseLetters() {
		driver.get(javascriptPage);
		
		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("me@eXample.com");
		
		assertThat(keyReporter.getValue(), Matchers.is("me@eXample.com"));
	}
	
	public void testArrowKeysShouldNotBePrintable() {
		driver.get(javascriptPage);
		
		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys(Keys.ARROW_LEFT);
		
		assertThat(keyReporter.getValue(), Matchers.is(""));
	}
	
	public void testShouldBeAbleToUseArrowKeys() {
		driver.get(javascriptPage);
		
		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("Tet", Keys.ARROW_LEFT, "s");
		
		assertThat(keyReporter.getValue(), Matchers.is("Test"));
	}
	
	public void xtestLongText() {
		driver.get(javascriptPage);
		
		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("qwer5t6yuil;'sdfgthjkl;xvbgnm,wertyuikol;sdcfgyhjkl;bhnm,.qwer5t6yuil;'sdfgthjkl;xvbgnm,wertyuikol;sdcfgyhjkl;bhnm,.qwer5t6yuil;'sdfgthjkl;xvbgnm,wertyuikol;sdcfgyhjkl;bhnm,.qwer5t6yuil;'sdfgthjkl;xvbgnm,wertyuikol;sdcfgyhjkl;bhnm,.qwer5t6yuil;'sdfgthjkl;xvbgnm,wertyuikol;sdcfgyhjkl;bhnm,.qwer5t6yuil;'sdfgthjkl;xvbgnm,wertyuikol;sdcfgyhjkl;bhnm,.qwer5t6yuil;'sdfgthjkl;xvbgnm,wertyuikol;sdcfgyhjkl;bhnm,.");
		
		assertThat(keyReporter.getValue(), Matchers.is("Test"));
	}
}
