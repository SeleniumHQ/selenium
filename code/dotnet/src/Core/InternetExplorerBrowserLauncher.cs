using System;
using System.Diagnostics;

namespace Selenium
{
	/// <summary>
	/// Summary description for DefualtBrowserLauncher.
	/// </summary>
	public class InternetExplorerBrowserLauncher : IBrowserLauncher
	{
		private Process browserProcess;

		public void Launch(string url)
		{
			ProcessStartInfo info = new ProcessStartInfo("IExplore.exe", url);
			browserProcess = Process.Start(info);
		}

		public void Close()
		{
			browserProcess.Kill();
			browserProcess.WaitForExit();
		}

		public int ProcessID
		{
			get { return browserProcess.Id; }
		}
	}
}