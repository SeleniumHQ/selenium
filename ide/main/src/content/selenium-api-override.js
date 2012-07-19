Selenium.prototype.doSendKeys = function(locator, value) {
    /**
    * *Experimental* Simulates keystroke events on the specified element, as though you typed the value key-by-key.
    *
    * <p>This simulates a real user typing every character in the specified string; it is also bound by the limitations of a
    * real user, like not being able to type into a invisible or read only elements. This is useful for dynamic UI widgets
    * (like auto-completing combo boxes) that require explicit key events.</p>
    * <p>Unlike the simple "type" command, which forces the specified value into the page directly, this command will not
    * replace the existing content. If you want to replace the existing contents, you need to use the simple "type" command to set the value of the
    * field to empty string to clear the field and then the "sendKeys" command to send the keystroke for what you want
    * to type.</p>
    * <p>This command is experimental. It may replace the typeKeys command in the future.</p>
    * <p>For those who are interested in the details, unlike the typeKeys command, which tries to
    * fire the keyDown, the keyUp and the keyPress events, this command is backed by the atoms from Selenium 2 and provides a
    * much more robust implementation that will be maintained in the future.</p>
    *
    *
    * @param locator an <a href="#locators">element locator</a>
    * @param value the value to type
    */
   if (this.browserbot.controlKeyDown || this.browserbot.altKeyDown || this.browserbot.metaKeyDown) {
        throw new SeleniumError("type not supported immediately after call to controlKeyDown() or altKeyDown() or metaKeyDown()");
    }
	
    var element = this.browserbot.findElement(locator);

	bot.action.type(element, value);
};

