using Selenium;
using ThoughtWorks.Selenium.Core;

namespace ThoughtWorks.Selenium.UnitTests
{
	/// <summary>
	/// Summary description for InternetExplorerBrowserLauncherTest.
	/// </summary>
	public class InternetExplorerBrowserLauncherTest : DefaultBrowserLauncherTest
	{
		protected override DefaultBrowserLauncher getBrowser()
		{
			return new InternetExplorerBrowserLauncher();
		}

	}
}
