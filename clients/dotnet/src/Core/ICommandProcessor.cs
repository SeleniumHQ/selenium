using System;

namespace Selenium
{
	/// <summary>
	/// Provides a DoCommand method, which sends the command to the browser to be performed.
	/// </summary>
	public interface ICommandProcessor
	{
		/// <summary>
		/// Send the specified Selenese command to the browser to be performed
		/// </summary>
		/// <param name="command">the Selenese command verb</param>
		/// <param name="args">the arguments to the Selenese command (depends on the verb)</param>
		/// <returns>the command result, defined by the Selenese JavaScript.  "getX" style
		///		commands may return data from the browser</returns>
		string DoCommand(string command, string[] args);
		/// <summary>
		/// Starts a new Selenium testing session
		/// </summary>
		void Start();
		/// <summary>
		/// Ends the current Selenium testing session (normally killing the browser)
		/// </summary>
		void Stop();
		/// <summary>
		/// Runs the specified Selenese accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the Selenese command verb</param>
		/// <param name="args">the arguments to the Selenese command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		String GetString(String command, String[] args);
		/// <summary>
		/// Runs the specified Selenese accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the Selenese command verb</param>
		/// <param name="args">the arguments to the Selenese command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		String[] GetStringArray(String command, String[] args);
		/// <summary>
		/// Runs the specified Selenese accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the Selenese command verb</param>
		/// <param name="args">the arguments to the Selenese command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		Decimal GetNumber(String command, String[] args);
		/// <summary>
		/// Runs the specified Selenese accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the Selenese command verb</param>
		/// <param name="args">the arguments to the Selenese command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		Decimal[] GetNumberArray(String command, String[] args);
		/// <summary>
		/// Runs the specified Selenese accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the Selenese command verb</param>
		/// <param name="args">the arguments to the Selenese command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		bool GetBoolean(String command, String[] args);
		/// <summary>
		/// Runs the specified Selenese accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the Selenese command verb</param>
		/// <param name="args">the arguments to the Selenese command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		bool[] GetBooleanArray(String command, String[] args);
	}
}
