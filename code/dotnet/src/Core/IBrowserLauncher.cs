using System;

namespace Selenium
{
	/// <summary>
	/// Summary description for IBrowserLauncher.
	/// </summary>
	public interface IBrowserLauncher
	{
		void Launch(string url);
		void Close();
	}
}
