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
		private const string URL = "http://www.yahoo.com";

		[Test]
		public void LaunchInternetExplorerShouldWork()
		{
			InternetExplorerBrowserLauncher launcher = new InternetExplorerBrowserLauncher();
			launcher.Launch(URL);
			Assert.IsTrue(launcher.ProcessID != 0);
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