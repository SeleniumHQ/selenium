using System;

namespace Selenium
{
	/// <summary>
	/// Summary description for ISelenium.
	/// </summary>
	public interface ISelenium : IStartable
	{
		void ChooseCancelOnNextConfirmation();
		void Click(String field);
		void ClickAndWait(String field);
		void Open(String path);
		void Pause(int duration); // is this needed for driven ?
		void SelectAndWait(String field, String value);
		void SelectWindow(String window);
		void SetTextField(String field, String value);
		void StoreText(String element, String value);
		void StoreValue(String field, String value);
		void TestComplete();
		void Type(String field, String value);
		void TypeAndWait(String field, String value);
		void VerifyAlert(String alert);
		void VerifyAttribute(String element, String value);
		void VerifyConfirmation(String confirmation);
		void VerifyElementNotPresent(String type);
		void VerifyElementPresent(String type);
		void VerifyLocation(String location);
		void VerifySelectOptions(String field, String[] values);
		void VerifySelected(String field, String value);
		void VerifyTable(String table, String value);
		void VerifyText(String type, String text);
		void VerifyTextPresent(String type, String text);
		void VerifyTitle(String title);
		void VerifyValue(String field, String value);
		String[] GetAllButtons();
		String[] GetAllLinks();
		String[] GetAllFields();
	}
}
