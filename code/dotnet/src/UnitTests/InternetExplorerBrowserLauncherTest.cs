using System;
using System.Diagnostics;
using NUnit.Framework;

namespace Selenium.UnitTests
{
	/// <summary>
	/// Summary description for DefaultBrowserLauncherTest.
	/// </summary>
	[TestFixture]
	public class InternetExplorerBrowserLauncherTest
	{
		private InternetExplorerBrowserLauncher launcher;
		private const string URL = "http://www.yahoo.com";

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
			launcher = new InternetExplorerBrowserLauncher();
			launcher.Launch(URL);
			Assert.IsTrue(this.launcher.ProcessID != 0);
		}

		[Test]
		[ExpectedException(typeof (ArgumentException))]
		public void CloseInternetExplorerShouldWork()
		{
			InternetExplorerBrowserLauncher launcher = new InternetExplorerBrowserLauncher();
			launcher.Launch(URL);
			launcher.Close();

			Process.GetProcessById(launcher.ProcessID);
		}
	}
}