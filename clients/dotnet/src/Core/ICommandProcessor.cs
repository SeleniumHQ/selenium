using System;

namespace Selenium
{
	/// <summary>
	/// Summary description for ICommandProcessor.
	/// </summary>
	public interface ICommandProcessor
	{
		string DoCommand(string command, string[] args);
		void Start();
		void Stop();
		String GetString(String command, String[] args);
		String[] GetStringArray(String command, String[] args);
		Decimal GetNumber(String command, String[] args);
		Decimal[] GetNumberArray(String command, String[] args);
		bool GetBoolean(String command, String[] args);
		bool[] GetBooleanArray(String command, String[] args);
	}
}
