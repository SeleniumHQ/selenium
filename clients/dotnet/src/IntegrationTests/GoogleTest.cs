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
			Assert.AreEqual("Google", selenium.GetTitle());
			selenium.Type("q", "Selenium OpenQA");
			Assert.AreEqual("Selenium OpenQA", selenium.GetValue("q"));
			selenium.Click("btnG");
			selenium.WaitForPageToLoad("5000");
			selenium.AssertTextPresent("www.openqa.org");
			Assert.AreEqual("Selenium OpenQA - Google Search", selenium.GetTitle());
		}
	}
}