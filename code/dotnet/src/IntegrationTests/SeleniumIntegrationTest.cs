using System;
using NUnit.Framework;
using Selenium;
using ThoughtWorks.Selenium.Core;

namespace ThoughtWorks.Selenium.IntegrationTests
{
	[TestFixture]
	public class SeleniumIntegrationTest
	{
		private ISelenium selenium;

		[SetUp]
		public void SetupTest()
		{
			HttpCommandProcessor processor = new HttpCommandProcessor();
			DefaultBrowserLauncher launcher = new DefaultBrowserLauncher();
			selenium = new DefaultSelenium(processor, launcher);
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
			selenium.Open("/testapp/test_click_page1.html");
			selenium.VerifyText("link", "Click here for next page");
			selenium.ClickAndWait("link");
			selenium.ClickAndWait("previousPage");
			selenium.VerifyLocation("/testapp/test_click_page1.html");
			selenium.TestComplete();
		}
	}
}