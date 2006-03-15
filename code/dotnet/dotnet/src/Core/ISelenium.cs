using System;

namespace Selenium
{
	/// <summary>
	/// Summary description for ISelenium.
	/// </summary>
	public interface ISelenium : IGeneratedSelenium
	{
		// DGF TODO replace *every* method with a non-generated definition
		new void ChooseCancelOnNextConfirmation();
		new void Click(String locator);
        new void KeyPress(String locator, int keycode);
        new void KeyDown(String locator, int keycode);
        new void MouseOver(String locator);
        new void MouseDown(String locator);
		new void Open(String url);
		new void SelectWindow(String window);
		new void Type(String field, String value);
		new void VerifyAlert(String alert);
		new void VerifyConfirmation(String confirmation);
		new void VerifyElementNotPresent(String locator);
		new void VerifyElementPresent(String locator);
		new void VerifyLocation(String location);
		new void VerifySelected(String locator, String value);
		new void VerifyTable(String tableLocator, String value);
		new void VerifyText(String locator, String text);
		new void VerifyTextPresent(String text);
		new void VerifyTitle(String title);
		new void VerifyValue(String locator, String value);
        new void SetContext(String context);
        new void SetContext(String context, String logLevel);
		new void WaitForPageToLoad(long timeout);
		new String[] GetAllButtons();
		new String[] GetAllLinks();
		new String[] GetAllFields();
        new String GetEval(String script);
		new void Start();
		new void Stop();
	}
}
