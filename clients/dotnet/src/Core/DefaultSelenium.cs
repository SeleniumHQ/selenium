using System;

namespace Selenium
{
	/// <summary>
	/// Summary description for DefaultSelenium.
	/// </summary>
public class DefaultSelenium : ISelenium
{
	private readonly ICommandProcessor processor;

	public ICommandProcessor Processor
	{
        get { return processor; }
	}

	public DefaultSelenium(String serverHost, int serverPort, String browserStartCommand, String browserURL)
	{
		this.processor = new HttpCommandProcessor(serverHost, serverPort, browserStartCommand, browserURL);
	}

	public DefaultSelenium(ICommandProcessor processor)
	{
        this.processor = processor;
    }

	public void AnswerOnNextPrompt(String answerString)
	{
		DoCommandAndFailIfNotSuccess("answerOnNextPrompt", answerString);
	}

	public void Check(String locator)
	{
		DoCommandAndFailIfNotSuccess("check", locator);
	}

	public void Close()
	{
		DoCommandAndFailIfNotSuccess("close");
	}

	public void ChooseCancelOnNextConfirmation()
	{
        DoCommandAndFailIfNotSuccess("chooseCancelOnNextConfirmation", "", "", "OK");
	}

	public void Click(String field)
	{
        DoCommandAndFailIfNotSuccess("click", field, "", "OK");
	}

	public void ClickAndWait(String field)
	{
        DoCommandAndFailIfNotSuccess("clickAndWait", field, "", "OK");
	}

	public void Open(String path)
	{
        DoCommandAndFailIfNotSuccess("open", path, "", "OK");
	}

	public void FireEvent(String locator, String eventName)
	{
		DoCommandAndFailIfNotSuccess("fireEvent", locator, eventName);
	}

	public String GetAbsoluteLocation()
	{
		return DoGet("getAbsoluteLocation");
	}

	public String GetAlert()
	{
		return DoGet("getAlert");
	}

	public String[] GetAllAccessors()
	{
		return DoGet("getAllAccessors").Split(',');
	}

	public String[] GetAllActions()
	{
		return DoGet("getAllAccessors").Split(',');
	}

	public String[] GetAllAsserts()
	{
		return DoGet("getAllAccessors").Split(',');
	}

	public String GetAttribute(String locator, String attribute)
	{
		return DoGet("getAttribute", locator + "@" + attribute);
	}

	public String GetChecked(String locator)
	{
		return DoGet("getChecked", locator);
	}

	public String GetConfirmation()
	{
		return DoGet("getConfirmation");
	}

	public String GetPrompt()
	{
		return DoGet("getPrompt");
	}

	public String[] GetSelectOptions(String locator)
	{
		return DoGet("getSelectOptions", locator).Split(',');
	}

	public String GetTable(String tableLocator)
	{
		return DoGet("getTable", tableLocator);
	}

	public String GetText(String locator)
	{
		return DoGet("getText", locator);
	}

	public String GetTitle()
	{
		return DoGet("getTitle");
	}

	public String GetValue(String locator)
	{
		return DoGet("getValue", locator);
	}

	public void GoBack()
	{
		DoCommandAndFailIfNotSuccess("goBack");
	}

	public void Select(String locator, String option)
	{
		DoCommandAndFailIfNotSuccess("select", locator, option);
	}

	public void Submit(String locator)
	{
		DoCommandAndFailIfNotSuccess("submit", locator);
	}

	public void Uncheck(String locator)
	{
		DoCommandAndFailIfNotSuccess("uncheck", locator);
	}

	public void VerifyAttribute(string locator, string attribute, string value)
	{
		DoVerifyAndFailIfNotSuccess("verifyAttribute", locator + "@" + attribute, value);
	}

	public void VerifyEditable(string locator)
	{
		DoVerifyAndFailIfNotSuccess("verifyEditable", locator);
	}

	public void VerifyNotEditable(string locator)
	{
		DoVerifyAndFailIfNotSuccess("verifyNotEditable", locator);
	}

	public void VerifyVisible(string locator)
	{
		DoVerifyAndFailIfNotSuccess("verifyVisible", locator);
	}

	public void VerifyNotVisible(string locator)
	{
		DoVerifyAndFailIfNotSuccess("verifyNotVisible", locator);
	}

	public void VerifyPrompt(string pattern)
	{
		DoVerifyAndFailIfNotSuccess("verifyPrompt", pattern);
	}

	public void VerifyTextNotPresent(string pattern)
	{
		DoVerifyAndFailIfNotSuccess("verifyTextNotPresent", pattern);
	}

	public void WaitForCondition(string script, long timeout)
	{
		DoVerifyAndFailIfNotSuccess("waitForCondition", script, System.Convert.ToString(timeout));
	}

	public void WaitForValue(string locator, string value)
	{
		DoVerifyAndFailIfNotSuccess("waitForValue", locator, value);
	}

	public void Pause(int duration)
	{
        DoCommandAndFailIfNotSuccess("pause", duration.ToString(), "", "OK");
	}

	public void SelectAndWait(String field, String value)
	{
        DoCommandAndFailIfNotSuccess("selectAndWait", field, value, "OK");
	}

	public void SelectWindow(String window)
	{
        DoCommandAndFailIfNotSuccess("selectWindow", window, "", "OK");
	}

	public void SetTextField(String field, String value)
	{
        DoCommandAndFailIfNotSuccess("setTextField", field, value, "OK");
	}

	public void StoreText(String element, String value)
	{
        DoCommandAndFailIfNotSuccess("storeText", element, value, "OK");
	}

	public void StoreValue(String field, String value)
	{
        DoCommandAndFailIfNotSuccess("storeValue", field, value, "OK");
	}

	public void TestComplete()
	{
        DoCommandAndFailIfNotSuccess("testComplete", "", "", "");
	}

	public void Type(String field, String value)
	{
        DoCommandAndFailIfNotSuccess("type", field, value, "OK");
	}

	public void TypeAndWait(String field, String value)
	{
        DoCommandAndFailIfNotSuccess("typeAndWait", field, value, "OK");
	}

	public void VerifyAlert(String alert)
	{
        DoCommandAndFailIfNotSuccess("verifyAlert", alert, "", "PASSED");
	}

	public void VerifyAttribute(String element, String value)
	{
        DoCommandAndFailIfNotSuccess("verifyAttribute", element, value, "PASSED");
	}

	public void VerifyConfirmation(String confirmation)
	{
        DoCommandAndFailIfNotSuccess("verifyConfirmation", confirmation, "", "PASSED");
	}

	public void VerifyElementNotPresent(String type)
	{
        DoCommandAndFailIfNotSuccess("verifyElementNotPresent", type, "", "PASSED");
	}

	public void VerifyElementPresent(String type)
	{
        DoCommandAndFailIfNotSuccess("verifyElementPresent", type, "", "PASSED");
	}

	public void VerifyLocation(String location)
	{
        DoCommandAndFailIfNotSuccess("verifyLocation", location, "", "PASSED");
	}

	public void VerifySelectOptions(String field, String[] values)
	{
        DoCommandAndFailIfNotSuccess("verifySelectOptions", field, String.Join(",", values), "PASSED");
	}

	public void VerifySelected(String field, String value)
	{
        DoCommandAndFailIfNotSuccess("verifySelected", field, value, "PASSED");
	}

	public void VerifyTable(String table, String value)
	{
        DoCommandAndFailIfNotSuccess("verifyTable", table, value, "PASSED");
	}

	public void VerifyText(String type, String text)
	{
        DoCommandAndFailIfNotSuccess("verifyText", type, text, "PASSED");
	}

	public void VerifyTextPresent(String text)
	{
        DoCommandAndFailIfNotSuccess("verifyTextPresent", text, "", "PASSED");
	}

	public void VerifyTitle(String title)
	{
        DoCommandAndFailIfNotSuccess("verifyTitle", title, "", "PASSED");
	}

	public void VerifyValue(String field, String value)
	{
        DoCommandAndFailIfNotSuccess("verifyValue", field, value, "PASSED");
	}

	public String[] GetAllButtons()
	{
        return processor.DoCommand("getAllButtons", "", "").Split(',');
	}

	public String[] GetAllLinks()
	{
        return processor.DoCommand("getAllLinks", "", "").Split(',');
	}

	public String[] GetAllFields()
	{
        return processor.DoCommand("getAllFields", "", "").Split(',');
	}

	public void Start()
	{
        processor.Start();
	}

	public void Stop()
	{
        processor.Stop();
	}

	public String GetEval(String script)
    {
        return processor.DoCommand("getEval", script, "");
    }

	public bool GetEvalBool(String script)
	{
		String eval = GetEval(script);
		return "true".Equals(eval);
	}

    public void SetContext(String context, String logLevel)
    {
        DoCommandAndFailIfNotSuccess("context", context, logLevel, "OK");
    }
    
    public void SetContext(String context)
    {
        SetContext(context, "");
    }
    
    public void KeyPress(String locator, int keycode)
    {
        DoCommandAndFailIfNotSuccess("keyPress", locator, "" + keycode, "OK");
    }
    
    public void KeyDown(String locator, int keycode)
    {
        DoCommandAndFailIfNotSuccess("keyDown", locator, "" + keycode,"OK");
    }
    
    public void MouseOver(String locator)
    {
        DoCommandAndFailIfNotSuccess("mouseOver", locator, "","OK");
    }
    
    public void MouseDown(String locator)
    {
        DoCommandAndFailIfNotSuccess("mouseDown", locator, "", "OK");
    }

	public void WaitForPageToLoad(long timeout)
	{
		DoCommandAndFailIfNotSuccess("waitForPageToLoad", System.Convert.ToString(timeout), "", "OK");
	}

	private string DoGet(string command, string argument1, string argument2)
	{
		return processor.DoCommand(command, argument1, argument2);
	}

	private string DoGet(string command, string argument1)
	{
		return processor.DoCommand(command, argument1, "");
	}

	private string DoGet(string command)
	{
		return processor.DoCommand(command, "", "");
	}

	private void DoVerifyAndFailIfNotSuccess(string command)
	{
		DoCommandAndFailIfNotSuccess(command, "", "", "PASSED");
	}

	private void DoVerifyAndFailIfNotSuccess(string command, string argument1)
	{
		DoCommandAndFailIfNotSuccess(command, argument1, "", "PASSED");
	}

	private void DoVerifyAndFailIfNotSuccess(string command, string argument1, string argument2)
	{
		DoCommandAndFailIfNotSuccess(command, argument1, argument2, "PASSED");
	}

	private void DoCommandAndFailIfNotSuccess(string command)
	{
		DoCommandAndFailIfNotSuccess(command, "", "", "OK");
	}

	private void DoCommandAndFailIfNotSuccess(string command, string argument1)
	{
		DoCommandAndFailIfNotSuccess(command, argument1, "", "OK");
	}

	private void DoCommandAndFailIfNotSuccess(string command, string argument1, string argument2)
	{
		DoCommandAndFailIfNotSuccess(command, argument1, argument2, "OK");
	}

	private void DoCommandAndFailIfNotSuccess(string command, string argument1, string argument2, string expectedResult)
    {
        string actualResult = processor.DoCommand(command, argument1, argument2);
        if (actualResult != expectedResult)
        {
            throw new SeleniumException(actualResult);
        }
    }
}
}
