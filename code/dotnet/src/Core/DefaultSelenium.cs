using System;

namespace Selenium
{
	/// <summary>
	/// Summary description for DefaultSelenium.
	/// </summary>
	public class DefaultSelenium : ISelenium
	{
		public static readonly string SELENIUM_DRIVER_URL = "http://localhost/selenium-driver/SeleneseRunner.html";

		private readonly IBrowserLauncher launcher;
		private readonly ICommandProcessor processor;	

		public ICommandProcessor Processor
		{
			get { return processor; }
		}

		public IBrowserLauncher Launcher
		{
			get { return launcher; }
		}

		public DefaultSelenium(ICommandProcessor processor, IBrowserLauncher launcher)
		{
			this.processor = processor;
			this.launcher = launcher;
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

		public void VerifyTextPresent(String type, String text)
		{
			DoCommandAndFailIfNotSuccess("verifyTextPresent", type, text, "PASSED");
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
			launcher.Launch(SELENIUM_DRIVER_URL);
		}

		public void Stop()
		{
			launcher.Close();
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
