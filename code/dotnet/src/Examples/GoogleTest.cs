using System;
using NUnit.Framework;
using Selenium;
using ThoughtWorks.Selenium.Core;

namespace ThoughtWorks.Selenium.IntegrationTests
{
	[TestFixture]
	public class GoogleTest
	{
		private ISelenium selenium;

		[SetUp]
		public void SetupTest()
		{
			HttpCommandProcessor processor = new HttpCommandProcessor();
			DefaultBrowserLauncher launcher = new InternetExplorerBrowserLauncher();
			selenium = new DefaultSelenium(processor, launcher, DefaultSelenium.SELENESE_RUNNER_URL.Replace("html", "hta"));
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
		public void GoogleSearch()
		{
			selenium.Open("http://www.google.com");
			selenium.VerifyTitle("Google");
			/*
			selenium.Type("q", "Selenium ThoughtWorks");
			selenium.VerifyValue("q", "Selenium ThoughtWorks");
			selenium.Click("btnG");
			selenium.VerifyTextPresent("", "selenium.thoughtworks.com");
			selenium.VerifyTitle("Google Search: Selenium ThoughtWorks");
			*/
			selenium.TestComplete();
		}
	}
}