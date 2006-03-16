using System;

namespace Selenium 
{

	/*This class was generated based on the Java Client Driver*/
	public interface IGeneratedSelenium 
	{
		void Type(string arg0, string arg1);
		string GetValue(string arg0);
		void Check(string arg0);
		void Start();
		void Stop();
		void Close();
		void Open(string arg0);
		void AnswerOnNextPrompt(string arg0);
		void ChooseCancelOnNextConfirmation();
		void Click(string arg0);
		void KeyPress(string arg0, int arg1);
		void KeyDown(string arg0, int arg1);
		void MouseOver(string arg0);
		void MouseDown(string arg0);
		void FireEvent(string arg0, string arg1);
		void GoBack();
		void Select(string arg0, string arg1);
		void SelectWindow(string arg0);
		void Submit(string arg0);
		void Uncheck(string arg0);
		void VerifyAlert(string arg0);
		void VerifyAttribute(string arg0, string arg1, string arg2);
		void VerifyConfirmation(string arg0);
		void VerifyEditable(string arg0);
		void VerifyElementNotPresent(string arg0);
		void VerifyElementPresent(string arg0);
		void VerifyLocation(string arg0);
		void VerifyNotEditable(string arg0);
		void VerifyNotVisible(string arg0);
		void VerifyPrompt(string arg0);
		void VerifySelected(string arg0, string arg1);
		void VerifyTable(string arg0, string arg1);
		void VerifyText(string arg0, string arg1);
		void VerifyTextPresent(string arg0);
		void VerifyTextNotPresent(string arg0);
		void VerifyTitle(string arg0);
		void VerifyValue(string arg0, string arg1);
		void VerifyVisible(string arg0);
		void WaitForValue(string arg0, string arg1);
		void WaitForCondition(string arg0, long arg1);
		void WaitForPageToLoad(long arg0);
		void SetContext(string arg0, string arg1);
		void SetContext(string arg0);
		string[] GetAllButtons();
		string[] GetAllLinks();
		string[] GetAllFields();
		string GetAttribute(string arg0, string arg1);
		string GetChecked(string arg0);
		string GetEval(string arg0);
		string GetTable(string arg0);
		string GetText(string arg0);
		string GetTitle();
		string GetAbsoluteLocation();
		string GetPrompt();
		string GetConfirmation();
		string GetAlert();
		string[] GetSelectOptions(string arg0);
		string[] GetAllActions();
		string[] GetAllAccessors();
		string[] GetAllAsserts();
	}}