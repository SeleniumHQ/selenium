using System.Diagnostics;
using ThoughtWorks.Selenium.Core;

namespace Selenium
{
	/// <summary>
	/// Summary description for DefualtBrowserLauncher.
	/// </summary>
	public class InternetExplorerBrowserLauncher : DefaultBrowserLauncher
	{

		public override void Launch(string url)
		{
			ProcessStartInfo info = new ProcessStartInfo("IExplore.exe", url);
			browserProcess = Process.Start(info);
		}

	}
}
