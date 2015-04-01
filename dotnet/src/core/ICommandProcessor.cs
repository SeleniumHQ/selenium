/*
 * Copyright 2015 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
using System;

namespace Selenium
{
	/// <summary>
	/// Provides a DoCommand method, which sends the command to the browser to be performed.
	/// </summary>
	public interface ICommandProcessor
	{
		/// <summary>
		/// Send the specified remote command to the browser to be performed
		/// </summary>
		/// <param name="command">the remote command verb</param>
		/// <param name="args">the arguments to the remote command (depends on the verb)</param>
		/// <returns>the command result, defined by the remote JavaScript.  "getX" style
		///		commands may return data from the browser</returns>
		string DoCommand(string command, string[] args);
        /// <summary>
        /// Sets the extension Javascript to be used in the created session
        /// </summary>
        /// <param name="extensionJs">The extension JavaScript to use.</param>
        void SetExtensionJs(string extensionJs) ;
		/// <summary>
		/// Starts a new Selenium testing session
		/// </summary>
		void Start();
        /// <summary>
        /// Starts a new Selenium testing session with the specified options
        /// </summary>
        /// <param name="optionsString">a string representing the options to start the session with.</param>
        void Start(string optionsString);
        /// <summary>
        /// Starts a new Selenium testing session with the specified options
        /// </summary>
        /// <param name="optionsObject">an Options object representing the options to start the session with.</param>
        void Start(Object optionsObject);
		/// <summary>
		/// Ends the current Selenium testing session (normally killing the browser)
		/// </summary>
		void Stop();
		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the remote command verb</param>
		/// <param name="args">the arguments to the remote command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		String GetString(String command, String[] args);
		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the remote command verb</param>
		/// <param name="args">the arguments to the remote command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		String[] GetStringArray(String command, String[] args);
		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the remote command verb</param>
		/// <param name="args">the arguments to the remote command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		Decimal GetNumber(String command, String[] args);
		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the remote command verb</param>
		/// <param name="args">the arguments to the remote command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		Decimal[] GetNumberArray(String command, String[] args);
		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the remote command verb</param>
		/// <param name="args">the arguments to the remote command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		bool GetBoolean(String command, String[] args);
		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="command">the remote command verb</param>
		/// <param name="args">the arguments to the remote command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		bool[] GetBooleanArray(String command, String[] args);
	}
}
