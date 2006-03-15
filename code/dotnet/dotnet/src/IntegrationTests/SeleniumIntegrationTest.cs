using System;
using System.Threading;
using NUnit.Framework;
using Selenium;

namespace ThoughtWorks.Selenium.IntegrationTests
{
	[TestFixture]
	public class SeleniumIntegrationTest
	{
		private ISelenium selenium;

		[SetUp]
		public void SetupTest()
		{
			selenium = new DefaultSelenium("localhost", 4444, "*firefox", "http://www.irian.at");
			selenium.Start();
		}

		[TearDown]
		public void TeardownTest()
		{
			try
			{
				selenium.Stop();
			}
			catch (Exception)
			{
				// Ignore errors if unable to close the browser
			}
		}

		[Test]
		public void IISIntegrationTest()
		{
			selenium.Open("http://www.irian.at/myfaces-sandbox/inputSuggestAjax.jsf");
			selenium.VerifyTextPresent("suggest");
			String elementID = "_idJsp0:_idJsp3";
			selenium.Type(elementID, "foo");
			// DGF On Mozilla a keyPress is needed, and types a letter.
			// On IE6, a keyDown is needed, and no letter is typed. :-p
			// NS On firefox, keyPress needed, no letter typed.
        
			bool isIE = "true".Equals(selenium.GetEval("isIE"));
			bool isFirefox = "true".Equals(selenium.GetEval("isFirefox"));
			bool isNetscape = "true".Equals(selenium.GetEval("isNetscape"));
			String verificationText = null;
			if (isIE) 
			{
				selenium.KeyDown(elementID, 120);
			} 
			else 
			{
				selenium.KeyPress(elementID, 120);
			}
			if (isNetscape) 
			{
				verificationText = "foox1";
			} 
			else if (isIE || isFirefox) 
			{
				verificationText = "foo1";
			}
			else 
			{
				throw new Exception("which browser is this?");
			}
			Thread.Sleep(2000);
			selenium.VerifyTextPresent(verificationText);
		}
	}
}