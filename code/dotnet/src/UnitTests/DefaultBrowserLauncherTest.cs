using System;
using System.Diagnostics;
using NUnit.Framework;
using Selenium;
using ThoughtWorks.Selenium.Core;

namespace ThoughtWorks.Selenium.UnitTests
{

	[TestFixture]
	public class DefaultBrowserLauncherTest
	{
		private DefaultBrowserLauncher launcher;
		private const string URL = "http://www.google.com/index.html";

		[TearDown]
		public void Teardown()
		{
			try
			{
				launcher.Close();
			}
			catch (Exception)
			{
				// Don't care about exceptions here
			}
		}

		[Test]
		public void LaunchInternetExplorerShouldWork()
		{
			launcher = getBrowser();
			launcher.Launch(URL);
			Assert.IsTrue(this.launcher.ProcessID != 0);
		}

		[Test]
		[ExpectedException(typeof (ArgumentException))]
		public void CloseInternetExplorerShouldWork()
		{
			launcher = getBrowser();
			launcher.Launch(URL);
			launcher.Close();

			Process.GetProcessById(launcher.ProcessID);
		}

		protected virtual DefaultBrowserLauncher getBrowser()
		{
			return new DefaultBrowserLauncher();
		}

	}
}