using System.Diagnostics;
using Microsoft.Win32;
using Selenium;

namespace ThoughtWorks.Selenium.Core
{
	public class DefaultBrowserLauncher : IBrowserLauncher
	{
		protected Process browserProcess;

		public virtual void Launch(string url)
		{
			string arguments;
			string browser;
			GetBrowserPathAndArguments(url, out browser, out arguments);

			ProcessStartInfo info = new ProcessStartInfo();

			info.FileName = browser;
			info.Arguments = arguments;
			info.Verb = "open";
			info.UseShellExecute = false;
			info.WindowStyle = ProcessWindowStyle.Maximized;
			browserProcess = Process.Start(info);

		}

		private static void GetBrowserPathAndArguments(string url, out string browser, out string arguments)
		{
			RegistryKey defaultBrowserKey = Registry.ClassesRoot.OpenSubKey(@"http\shell\open\command");

			string browserPath = (string) defaultBrowserKey.GetValue("");
			browserPath = browserPath.Replace("%1", url);

			browser = browserPath.Substring(0, browserPath.IndexOf(' '));
			arguments = browserPath.Substring(browserPath.IndexOf(' ') + 1);

		}

		public virtual void Close()
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