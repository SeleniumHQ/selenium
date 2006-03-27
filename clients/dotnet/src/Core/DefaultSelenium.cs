// This file has been automatically generated via XSL
using System;
namespace Selenium
{
	// This file has been automatically generated using XSL
	// This part of the file is hard-coded in the XSL
	public class DefaultSelenium : ISelenium
	{
	
		private ICommandProcessor commandProcessor;
		/// <summary>
		/// Uses a CommandBridgeClient, specifying a server host/port, a command to launch the browser, and a starting URL for the browser.
		/// 
		/// <p><i>browserString</i> may be any one of the following:</p>
		/// <ul>
		/// <li><code>*firefox [absolute path]</code> - Automatically launch a new Firefox process using a custom Firefox profile.
		/// This profile will be automatically configured to use the Selenium Server as a proxy and to have all annoying prompts
		/// ("save your password?" "forms are insecure" "make Firefox your default browser?" disabled.  You may optionally specify
		/// an absolute path to your firefox executable, or just say "*firefox".  If no absolute path is specified, we'll look for
		/// firefox.exe in a default location (normally c:\program files\mozilla firefox\firefox.exe), which you can override by
		/// setting the Java system property <code>firefoxDefaultPath</code> to the correct path to Firefox.</li>
		/// <li><code>*iexplore [absolute path]</code> - Automatically launch a new Internet Explorer process using custom Windows registry settings.
		/// This process will be automatically configured to use the Selenium Server as a proxy and to have all annoying prompts
		/// ("save your password?" "forms are insecure" "make Firefox your default browser?" disabled.  You may optionally specify
		/// an absolute path to your iexplore executable, or just say "*iexplore".  If no absolute path is specified, we'll look for
		/// iexplore.exe in a default location (normally c:\program files\internet explorer\iexplore.exe), which you can override by
		/// setting the Java system property <code>iexploreDefaultPath</code> to the correct path to Internet Explorer.</li>
		/// <li><code>/path/to/my/browser [other arguments]</code> - You may also simply specify the absolute path to your browser
		/// executable, or use a relative path to your executable (which we'll try to find on your path).  <b>Warning:</b> If you
		/// specify your own custom browser, it's up to you to configure it correctly.  At a minimum, you'll need to configure your
		/// browser to use the Selenium Server as a proxy, and disable all browser-specific prompting.</li>
		/// </ul>
		/// </summary>
		/// 
		/// <param name="serverHost">the host name on which the Selenium Server resides</param>
		/// <param name="serverPort">the port on which the Selenium Server is listening</param>
		/// <param name="browserString">the command string used to launch the browser, e.g. "*firefox", "*iexplore" or "c:\\program files\\internet explorer\\iexplore.exe"</param>
		/// <param name="browserURL">the starting URL including just a domain name.  We'll start the browser pointing at the Selenium resources on this URL,
		/// e.g. "http://www.google.com" would send the browser to "http://www.google.com/selenium-server/SeleneseRunner.html"</param>
		public DefaultSelenium(String serverHost, int serverPort, String browserStartCommand, String browserURL)
		{
			this.commandProcessor = new HttpCommandProcessor(serverHost, serverPort, browserStartCommand, browserURL);
		}
	    
		/// <summary>
		/// Uses an arbitrary CommandProcessor
		/// </summary>
		public DefaultSelenium(ICommandProcessor processor)
		{
			this.commandProcessor = processor;
		}
	    
		public ICommandProcessor Processor
		{
			get { return this.commandProcessor; }
		}
		
		public void Start()
		{
			commandProcessor.Start();
		}
		
		public void Stop()
		{
			commandProcessor.Stop();
		}
	    
		// From here on, everything in this file has been auto-generated
	    
		public void Click(String locator)
		{
			commandProcessor.DoCommand("click", new String[] {locator,});
		}

		public void KeyPress(String locator,String keycode)
		{
			commandProcessor.DoCommand("keyPress", new String[] {locator,keycode,});
		}

		public void KeyDown(String locator,String keycode)
		{
			commandProcessor.DoCommand("keyDown", new String[] {locator,keycode,});
		}

		public void MouseOver(String locator)
		{
			commandProcessor.DoCommand("mouseOver", new String[] {locator,});
		}

		public void MouseDown(String locator)
		{
			commandProcessor.DoCommand("mouseDown", new String[] {locator,});
		}

		public void Type(String locator,String value)
		{
			commandProcessor.DoCommand("type", new String[] {locator,value,});
		}

		public void Check(String locator)
		{
			commandProcessor.DoCommand("check", new String[] {locator,});
		}

		public void Uncheck(String locator)
		{
			commandProcessor.DoCommand("uncheck", new String[] {locator,});
		}

		public void Select(String locator,String optionLocator)
		{
			commandProcessor.DoCommand("select", new String[] {locator,optionLocator,});
		}

		public void Submit(String formLocator)
		{
			commandProcessor.DoCommand("submit", new String[] {formLocator,});
		}

		public void Open(String url)
		{
			commandProcessor.DoCommand("open", new String[] {url,});
		}

		public void SelectWindow(String windowID)
		{
			commandProcessor.DoCommand("selectWindow", new String[] {windowID,});
		}

		public void ChooseCancelOnNextConfirmation()
		{
			commandProcessor.DoCommand("chooseCancelOnNextConfirmation", new String[] {});
		}

		public void AnswerOnNextPrompt(String answer)
		{
			commandProcessor.DoCommand("answerOnNextPrompt", new String[] {answer,});
		}

		public void GoBack()
		{
			commandProcessor.DoCommand("goBack", new String[] {});
		}

		public void Close()
		{
			commandProcessor.DoCommand("close", new String[] {});
		}

		public void FireEvent(String locator,String eventName)
		{
			commandProcessor.DoCommand("fireEvent", new String[] {locator,eventName,});
		}

		public String GetAlert()
		{
			return commandProcessor.GetString("getAlert", new String[] {});
		}

		public String GetConfirmation()
		{
			return commandProcessor.GetString("getConfirmation", new String[] {});
		}

		public String GetPrompt()
		{
			return commandProcessor.GetString("getPrompt", new String[] {});
		}

		public String GetAbsoluteLocation()
		{
			return commandProcessor.GetString("getAbsoluteLocation", new String[] {});
		}

		public void AssertLocation(String expectedLocation)
		{
			commandProcessor.DoCommand("assertLocation", new String[] {expectedLocation,});
		}

		public String GetTitle()
		{
			return commandProcessor.GetString("getTitle", new String[] {});
		}

		public String GetBodyText()
		{
			return commandProcessor.GetString("getBodyText", new String[] {});
		}

		public String GetValue(String locator)
		{
			return commandProcessor.GetString("getValue", new String[] {locator,});
		}

		public String GetText(String locator)
		{
			return commandProcessor.GetString("getText", new String[] {locator,});
		}

		public String GetEval(String script)
		{
			return commandProcessor.GetString("getEval", new String[] {script,});
		}

		public String GetChecked(String locator)
		{
			return commandProcessor.GetString("getChecked", new String[] {locator,});
		}

		public String GetTable(String tableCellAddress)
		{
			return commandProcessor.GetString("getTable", new String[] {tableCellAddress,});
		}

		public void AssertSelected(String locator,String optionLocator)
		{
			commandProcessor.DoCommand("assertSelected", new String[] {locator,optionLocator,});
		}

		public String[] GetSelectOptions(String locator)
		{
			return commandProcessor.GetStringArray("getSelectOptions", new String[] {locator,});
		}

		public String GetAttribute(String attributeLocator)
		{
			return commandProcessor.GetString("getAttribute", new String[] {attributeLocator,});
		}

		public void AssertTextPresent(String pattern)
		{
			commandProcessor.DoCommand("assertTextPresent", new String[] {pattern,});
		}

		public void AssertTextNotPresent(String pattern)
		{
			commandProcessor.DoCommand("assertTextNotPresent", new String[] {pattern,});
		}

		public void AssertElementPresent(String locator)
		{
			commandProcessor.DoCommand("assertElementPresent", new String[] {locator,});
		}

		public void AssertElementNotPresent(String locator)
		{
			commandProcessor.DoCommand("assertElementNotPresent", new String[] {locator,});
		}

		public void AssertVisible(String locator)
		{
			commandProcessor.DoCommand("assertVisible", new String[] {locator,});
		}

		public void AssertNotVisible(String locator)
		{
			commandProcessor.DoCommand("assertNotVisible", new String[] {locator,});
		}

		public void AssertEditable(String locator)
		{
			commandProcessor.DoCommand("assertEditable", new String[] {locator,});
		}

		public void AssertNotEditable(String locator)
		{
			commandProcessor.DoCommand("assertNotEditable", new String[] {locator,});
		}

		public String[] GetAllButtons()
		{
			return commandProcessor.GetStringArray("getAllButtons", new String[] {});
		}

		public String[] GetAllLinks()
		{
			return commandProcessor.GetStringArray("getAllLinks", new String[] {});
		}

		public String[] GetAllFields()
		{
			return commandProcessor.GetStringArray("getAllFields", new String[] {});
		}

		public void SetContext(String context,String logLevelThreshold)
		{
			commandProcessor.DoCommand("setContext", new String[] {context,logLevelThreshold,});
		}

		public String GetExpression(String expression)
		{
			return commandProcessor.GetString("getExpression", new String[] {expression,});
		}

		public void WaitForCondition(String script,String timeout)
		{
			commandProcessor.DoCommand("waitForCondition", new String[] {script,timeout,});
		}

		public void WaitForPageToLoad(String timeout)
		{
			commandProcessor.DoCommand("waitForPageToLoad", new String[] {timeout,});
		}

	}
}