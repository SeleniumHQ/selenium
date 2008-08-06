package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

import org.openqa.selenium.internal.OperatingSystem;

public class TypingTest extends AbstractDriverTestCase {
	@JavascriptEnabled
	public void testShouldFireKeyPressEvents() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("a");

		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), containsString("press:"));
	}

	@JavascriptEnabled
	public void testShouldFireKeyDownEvents() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("I");

		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), containsString("down:"));
	}

	@JavascriptEnabled
	public void testShouldFireKeyUpEvents() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("a");

		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), containsString("up:"));
	}

	public void testShouldTypeLowerCaseLetters() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("abc def");

		assertThat(keyReporter.getValue(), is("abc def"));
	}

	public void testShouldBeAbleToTypeCapitalLetters() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("ABC DEF");

		assertThat(keyReporter.getValue(), is("ABC DEF"));
	}

  @Ignore("safari")
  public void testShouldBeAbleToTypeQuoteMarks() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("\"");

		assertThat(keyReporter.getValue(), is("\""));
	}

	public void testShouldBeAbleToMixUpperAndLowerCaseLetters() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("me@eXample.com");

		assertThat(keyReporter.getValue(), is("me@eXample.com"));
	}

	@Ignore("htmlunit, safari")
	public void testArrowKeysShouldNotBePrintable() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys(Keys.ARROW_LEFT);

		assertThat(keyReporter.getValue(), is(""));
	}

	@Ignore("htmlunit, safari")
	public void testShouldBeAbleToUseArrowKeys() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("Tet", Keys.ARROW_LEFT, "s");

        assertThat(keyReporter.getValue(), is("Test"));
	}

	@JavascriptEnabled
	@Ignore("htmlunit")
	public void testWillSimulateAKeyUpWhenEnteringTextIntoInputElements() {
		driver.get(javascriptPage);

		WebElement element = driver.findElement(By.id("keyUp"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), equalTo("I like cheese"));
	}

	@JavascriptEnabled
	public void testWillSimulateAKeyDownWhenEnteringTextIntoInputElements() {
		driver.get(javascriptPage);

		WebElement element = driver.findElement(By.id("keyDown"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertThat(result.getText(), equalTo("I like chees"));
	}

	@JavascriptEnabled
	public void testWillSimulateAKeyPressWhenEnteringTextIntoInputElements() {
		driver.get(javascriptPage);

		WebElement element = driver.findElement(By.id("keyPress"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertThat(result.getText(), equalTo("I like chees"));
	}

	@JavascriptEnabled
    @Ignore("htmlunit")
    public void testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas() {
		driver.get(javascriptPage);

		WebElement element = driver.findElement(By.id("keyUpArea"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), equalTo("I like cheese"));
	}

	@JavascriptEnabled
	public void testWillSimulateAKeyDownWhenEnteringTextIntoTextAreas() {
		driver.get(javascriptPage);

		WebElement element = driver.findElement(By.id("keyDownArea"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertThat(result.getText(), equalTo("I like chees"));
	}

	@JavascriptEnabled
	public void testWillSimulateAKeyPressWhenEnteringTextIntoTextAreas() {
		driver.get(javascriptPage);

		WebElement element = driver.findElement(By.id("keyPressArea"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertThat(result.getText(), equalTo("I like chees"));
	}

	@JavascriptEnabled
	@Ignore(value = "safari, htmlunit, firefox", reason = "not implemeted in safari," +
	    " not yet tested in htmlunit. Firefox demands to have the focus on the window already")
	public void testShouldFireFocusKeyEventsInTheRightOrder() {
		driver.get(javascriptPage);

		driver.findElement(By.id("theworks")).sendKeys("a");
		String result = driver.findElement(By.id("result")).getText();

		assertThat(result.trim(), is("focus keydown keypress keyup"));
	}

    @JavascriptEnabled
    @Ignore("ie, safari, htmlunit")
    public void testShouldReportKeyCodeOfArrowKeys() {
        driver.get(javascriptPage);

        WebElement result = driver.findElement(By.id("result"));
        WebElement element = driver.findElement(By.id("keyReporter"));

        element.sendKeys(Keys.ARROW_DOWN);
        assertThat(result.getText().trim(), is("down: 40 press: 40 up: 40"));

        element.sendKeys(Keys.ARROW_UP);
        assertThat(result.getText().trim(), is("down: 38 press: 38 up: 38"));

        element.sendKeys(Keys.ARROW_LEFT);
        assertThat(result.getText().trim(), is("down: 37 press: 37 up: 37"));

        element.sendKeys(Keys.ARROW_RIGHT);
        assertThat(result.getText().trim(), is("down: 39 press: 39 up: 39"));

        // And leave no rubbish/printable keys in the "keyReporter"
        assertThat(element.getValue(), is(""));
    }

	@JavascriptEnabled
    @Ignore(value= "safari, htmlunit", reason = "untested user agents")
	public void testShouldReportKeyCodeOfArrowKeysUpDownEvents() {
		driver.get(javascriptPage);

		WebElement result = driver.findElement(By.id("result"));
		WebElement element = driver.findElement(By.id("keyReporter"));

		element.sendKeys(Keys.ARROW_DOWN);
        assertThat(result.getText().trim(), containsString("down: 40"));
        assertThat(result.getText().trim(), containsString("up: 40"));

		element.sendKeys(Keys.ARROW_UP);
        assertThat(result.getText().trim(), containsString("down: 38"));
        assertThat(result.getText().trim(), containsString("up: 38"));

		element.sendKeys(Keys.ARROW_LEFT);
        assertThat(result.getText().trim(), containsString("down: 37"));
        assertThat(result.getText().trim(), containsString("up: 37"));

		element.sendKeys(Keys.ARROW_RIGHT);
        assertThat(result.getText().trim(), containsString("down: 39"));
        assertThat(result.getText().trim(), containsString("up: 39"));

        // And leave no rubbish/printable keys in the "keyReporter"
        assertThat(element.getValue(), is(""));
	}

    @JavascriptEnabled
    @Ignore(value= "safari, htmlunit", reason = "untested user agents")
    public void testNumericNonShiftKeys() {
        driver.get(javascriptPage);

        WebElement element = driver.findElement(By.id("keyReporter"));

        String numericLineCharsNonShifted = "`1234567890-=[]\\;,.'/42";
        element.sendKeys(numericLineCharsNonShifted);

        assertThat(element.getValue(), is(numericLineCharsNonShifted));
    }

    @JavascriptEnabled
    @Ignore("ie, safari, htmlunit")
    public void testNumericShiftKeys() {
        driver.get(javascriptPage);

        WebElement result = driver.findElement(By.id("result"));
        WebElement element = driver.findElement(By.id("keyReporter"));

        String numericShiftsEtc = "~!@#$%^&*()_+{}:\"<>?|END~";
        element.sendKeys(numericShiftsEtc);

        assertThat(element.getValue(), is(numericShiftsEtc));
        assertThat(result.getText().trim(), containsString(" up: 16"));
    }

    @JavascriptEnabled
    @Ignore(value= "safari, htmlunit", reason = "untested user agents")
    public void testLowerCaseAlphaKeys() {
        driver.get(javascriptPage);

        WebElement element = driver.findElement(By.id("keyReporter"));

        String lowerAlphas = "abcdefghijklmnopqrstuvwxyz";
        element.sendKeys(lowerAlphas);

        assertThat(element.getValue(), is(lowerAlphas));
    }

    @JavascriptEnabled
    @Ignore(value= "safari, htmlunit", reason = "untested user agents")
    public void testUppercaseAlphaKeys() {
        driver.get(javascriptPage);

        WebElement result = driver.findElement(By.id("result"));
        WebElement element = driver.findElement(By.id("keyReporter"));

        String upperAlphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        element.sendKeys(upperAlphas);

        assertThat(element.getValue(), is(upperAlphas));
        assertThat(result.getText().trim(), containsString(" up: 16"));
    }

    @JavascriptEnabled
    @Ignore(value= "safari, htmlunit", reason = "untested user agents")
    public void testAllPrintableKeys() {
        driver.get(javascriptPage);

        WebElement result = driver.findElement(By.id("result"));
        WebElement element = driver.findElement(By.id("keyReporter"));

        String allPrintable =
             "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFGHIJKLMNO" +
             "PQRSTUVWXYZ [\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
        element.sendKeys(allPrintable);

        assertThat(element.getValue(), is(allPrintable));
        assertThat(result.getText().trim(), containsString(" up: 16"));
    }

    @Ignore(value= "ie, safari, htmlunit", reason = "untested user agents")
    public void testArrowKeysAndPageUpAndDown() {
    	driver.get(javascriptPage);
    	
        WebElement element = driver.findElement(By.id("keyReporter"));

        element.sendKeys("a" + Keys.LEFT + "b" + Keys.RIGHT +
            Keys.PAGE_UP + Keys.PAGE_DOWN +"1");

        assertThat(element.getValue(), is("ba1"));
    }
    
    @JavascriptEnabled
    @Ignore(value= "ie, safari, htmlunit", reason = "untested user agents")
    public void testHomeAndEndAndPageUpAndPageDownKeys() {
    	// Home keys only work on Windows
    	if (OperatingSystem.getCurrentPlatform() != OperatingSystem.WINDOWS)
    		return;

        driver.get(javascriptPage);

        WebElement element = driver.findElement(By.id("keyReporter"));

        element.sendKeys("abc" + Keys.HOME + "0" + Keys.LEFT + Keys.RIGHT +
            Keys.PAGE_UP + Keys.PAGE_DOWN + Keys.END + "1" + Keys.HOME +
            "0" + Keys.PAGE_UP + Keys.END + "111" + Keys.HOME + "00");

        assertThat(element.getValue(), is("0000abc1111"));
    }

    @JavascriptEnabled
    @Ignore(value= "safari, htmlunit", reason = "untested user agents")
    public void testDeleteAndBackspaceKeys() {
        driver.get(javascriptPage);

        WebElement element = driver.findElement(By.id("keyReporter"));

        element.sendKeys("abcdefghi");
        assertThat(element.getValue(), is("abcdefghi"));

        element.sendKeys(Keys.LEFT, Keys.LEFT, Keys.DELETE);
        assertThat(element.getValue(), is("abcdefgi"));

        element.sendKeys(Keys.LEFT, Keys.LEFT, Keys.BACK_SPACE);
        assertThat(element.getValue(), is("abcdfgi"));
    }

    @JavascriptEnabled
    @Ignore(value= "ie, safari, htmlunit", reason = "untested user agents")
    public void testSpecialSpaceKeys() {
        driver.get(javascriptPage);

        WebElement element = driver.findElement(By.id("keyReporter"));

        element.sendKeys("abcd" + Keys.SPACE + "fgh" + Keys.SPACE + "ij");
        assertThat(element.getValue(), is("abcd fgh ij"));
    }

    @JavascriptEnabled
    @Ignore(value= "ie, safari, htmlunit", reason = "untested user agents")
    public void testNumberpadAndFunctionKeys() {
        driver.get(javascriptPage);

        WebElement element = driver.findElement(By.id("keyReporter"));

        element.sendKeys("abcd" + Keys.MULTIPLY + Keys.SUBTRACT + Keys.ADD +
            Keys.DECIMAL + Keys.SEPARATOR + Keys.NUMPAD0 + Keys.NUMPAD9 +
            Keys.ADD + Keys.SEMICOLON + Keys.EQUALS + Keys.DIVIDE +
            Keys.NUMPAD3 + "abcd");

        assertThat(element.getValue(), is("abcd*-+.,09+;=/3abcd"));

        element.clear();
        element.sendKeys("FUNCTION" + Keys.F2 + "-KEYS" + Keys.F2);
        element.sendKeys("" + Keys.F2 + "-TOO" + Keys.F2);

        assertThat(element.getValue(), is("FUNCTION-KEYS-TOO"));
    }

    @JavascriptEnabled
    @Ignore(value= "ie, safari, htmlunit", reason = "untested user agents, broken in ie")
    public void testShiftSelectionDeletes() {
        driver.get(javascriptPage);

        WebElement element = driver.findElement(By.id("keyReporter"));

        element.sendKeys("abcd efgh");
        assertThat(element.getValue(), is("abcd efgh"));

        element.sendKeys(Keys.SHIFT, Keys.LEFT, Keys.LEFT, Keys.LEFT, Keys.BACK_SPACE);

        assertThat(element.getValue(), is("abcd e"));
    }

    @JavascriptEnabled
    @Ignore(value= "safari, htmlunit", reason = "untested user agents")
    public void testChordControlHomeShiftEndDelete() {
    	// The home and end keys only work this way on Windows
    	if (OperatingSystem.getCurrentPlatform() != OperatingSystem.WINDOWS)
    		return;
    	
        driver.get(javascriptPage);

        WebElement result = driver.findElement(By.id("result"));
        WebElement element = driver.findElement(By.id("keyReporter"));

        element.sendKeys("!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG");

        element.sendKeys("" + Keys.CONTROL + Keys.HOME);
        element.sendKeys("" +  Keys.SHIFT + Keys.END + Keys.HOME + Keys.END +
            Keys.HOME + Keys.END + Keys.HOME + Keys.END + Keys.DELETE);

        assertThat(element.getValue(), is(""));
        assertThat(result.getText(), containsString(" up: 16"));
    }

    @JavascriptEnabled
    @Ignore(value= "ie, safari, htmlunit", reason = "untested user agents, broken in ie")
    public void testChordReveseShiftHomeSelectionDeletes() {
    	// The home and end keys only work this way on Windows
    	if (OperatingSystem.getCurrentPlatform() != OperatingSystem.WINDOWS)
    		return;

        driver.get(javascriptPage);

        WebElement result = driver.findElement(By.id("result"));
        WebElement element = driver.findElement(By.id("keyReporter"));

        element.sendKeys("done" + Keys.HOME);
        assertThat(element.getValue(), is("done"));

        element.sendKeys("" + Keys.SHIFT + "ALL " + Keys.HOME);
        assertThat(element.getValue(), is("ALL done"));

        element.sendKeys("" + Keys.DELETE);
        assertThat(element.getValue(), is("done"));

        element.sendKeys("" + Keys.END + Keys.SHIFT + Keys.HOME);
        assertThat(element.getValue(), is("done"));
        assertThat(  // Note: trailing SHIFT up here
            result.getText().trim(), containsString(" up: 16"));

        element.sendKeys("" + Keys.DELETE);
        assertThat(element.getValue(), is(""));
    }

    // win32-specific control-x control-v here for cut & paste tests, and so
    // a TODO: methods for per OS platform cut and paste key sequences.

    @JavascriptEnabled
    @Ignore(value= "ie, safari, htmlunit", reason = "untested user agents, " +
        "broken in ie")
    public void testChordControlCutAndPaste() {
    	if (OperatingSystem.getCurrentPlatform() != OperatingSystem.WINDOWS)
    		return;
    	
        driver.get(javascriptPage);

        WebElement element = driver.findElement(By.id("keyReporter"));

        String paste = "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG";
        element.sendKeys(paste);
        assertThat(element.getValue(), is(paste));

        element.sendKeys("" + Keys.CONTROL + Keys.HOME + Keys.NULL +
            Keys.SHIFT + Keys.END);

        element.sendKeys("" +  Keys.CONTROL + "x");
        assertThat(element.getValue(), is(""));

        element.sendKeys("" +  Keys.CONTROL + "v");
        assertThat(element.getValue(), is(paste));

        element.sendKeys("" + Keys.LEFT + Keys.LEFT + Keys.LEFT +
            Keys.SHIFT + Keys.END);
        element.sendKeys("" +  Keys.CONTROL + "x" + "v");
        assertThat(element.getValue(), is(paste));

        element.sendKeys("" +  Keys.HOME);
        element.sendKeys("" +  Keys.CONTROL + "v");
        element.sendKeys("" +  Keys.CONTROL + "v" + "v");
        element.sendKeys("" +  Keys.CONTROL + "v" + "v" + "v");
        assertThat(element.getValue(), is("EFGEFGEFGEFGEFGEFG" + paste));

        element.sendKeys("" + Keys.END + Keys.SHIFT + Keys.HOME +
            Keys.NULL + Keys.DELETE);
        assertThat(element.getValue(), is(""));
    }

    @JavascriptEnabled
    public void testShouldTypeIntoInputElementsThatHaveNoTypeAttribute() {
        driver.get(formPage);

        WebElement element = driver.findElement(By.id("no-type"));
        element.sendKeys("Should Say Cheese");

        assertThat(element.getValue(), is("Should Say Cheese"));
    }

    @JavascriptEnabled
    @Ignore("ie, safari, htmlunit")
    public void testShouldNotTypeIntoElementsThatPreventKeyDownEvents() {
    	driver.get(javascriptPage);

    	WebElement silent = driver.findElement(By.name("suppress"));

		silent.sendKeys("Should not see me at all");
    	assertThat(silent.getValue(), is(""));
    }
    
    @JavascriptEnabled
    @Ignore("ie, safari, htmlunit")
    public void testGenerateKeyPressEventEvenWhenElementPreventsDefault() {
    	driver.get(javascriptPage);

    	WebElement silent = driver.findElement(By.name("suppress"));
    	WebElement result = driver.findElement(By.id("result"));

		silent.sendKeys("s");
    	assertThat(result.getText(), containsString("press"));
    }
}
