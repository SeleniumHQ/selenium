using System;

namespace Selenium
{
	/// <summary>
	/// Summary description for ICommandProcessor.
	/// </summary>
	public interface ICommandProcessor
	{
		string DoCommand(string command, string  field, string value);
		void Start();
		void Stop();
	}
}
