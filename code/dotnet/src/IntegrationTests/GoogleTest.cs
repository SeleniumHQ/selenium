using System;
using NUnit.Framework;
using Selenium;

namespace ThoughtWorks.Selenium.IntegrationTests
{
	[TestFixture]
	public class GoogleTest
	{
		private ISelenium selenium;

		[SetUp]
		public void SetupTest()
		{
			selenium = new DefaultSelenium("localhost", 4444, "*firefox", "http://www.google.com");
			selenium.Start();
		}

		[TearDown]
		public void TeardownTest()
		{
			selenium.Stop();
		}

		[Test]
		public void GoogleSearch()
		{
			selenium.Open("http://www.google.com");
			selenium.VerifyTitle("Google");
			selenium.Type("q", "Selenium OpenQA");
			selenium.VerifyValue("q", "Selenium OpenQA");
			selenium.Click("btnG");
			selenium.WaitForPageToLoad(5000);
			selenium.VerifyTextPresent("www.openqa.org");
			selenium.VerifyTitle("Selenium OpenQA - Google Search");
		}
	}
}