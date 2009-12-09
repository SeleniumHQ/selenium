/*
 * Copyright 2006 ThoughtWorks, Inc.
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
using System.Web;
using System.Text;
namespace Selenium
{
	/// <summary>
	/// A representation of a single remote Command
	/// </summary>
	public class DefaultRemoteCommand : IRemoteCommand
	{
		private static readonly string PARSE_ERROR_MESSAGE = "Command string must contain 4 pipe characters and should start with a '|'. Unable to parse command string";
		private readonly string[] args;
		private readonly string command;

		/// <summary>
		/// Creates a command with the specified arguments
		/// </summary>
		/// <param name="command">the name of the command to run</param>
		/// <param name="args">its arguments (convert non-string arguments to strings)</param>
		public DefaultRemoteCommand(string command, string[] args)
		{
			this.command = command;
			this.args = args;
		}

		/// <summary>
		/// The string token that we'll send to the server
		/// </summary>
		public string CommandString
		{
			get
			{
				StringBuilder sb = new StringBuilder("cmd=");
				sb.Append(HttpUtility.UrlEncode(command));
				if (args == null) return sb.ToString();
				for (int i = 0; i < args.Length; i++)
				{
					sb.Append('&').Append((i+1).ToString()).Append('=').Append(HttpUtility.UrlEncode(args[i]));
				}
				return sb.ToString();
			}
		}
		
		/// <summary>
		/// The name of the Selenium command verb
		/// </summary>
		public string Command
		{
			get { return command; }
		}

		/// <summary>
		/// The array of arguments for this command
		/// </summary>
		public string[] Args
		{
			get { return args; }
		}

		/// <summary>
		/// Parses a "wiki-style" command string, like this: |type|q|Hello World|
		/// </summary>
		/// <param name="commandString">a wiki-style command string to parse</param>
		/// <returns>a Remote Command object that implements the command string</returns>
		public static DefaultRemoteCommand Parse(string commandString)
		{
			if (commandString == null || commandString.Trim().Length == 0 || !commandString.StartsWith("|"))
			{
				throw new ArgumentException(PARSE_ERROR_MESSAGE + "'" + commandString + "'.");
			}

			string[] commandArray = commandString.Split(new char[] { '|' });
			
			if (commandArray.Length != 5)
			{
				throw new ArgumentException(PARSE_ERROR_MESSAGE + "'" + commandString + "'.");
			}
			
			return new DefaultRemoteCommand(commandArray[1], new String[] {commandArray[2], commandArray[3]});
		}
	}
}
