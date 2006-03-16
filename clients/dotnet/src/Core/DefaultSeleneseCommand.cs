using System;

namespace Selenium
{
	/// <summary>
	/// Summary description for DefaultSeleneseCommand.
	/// </summary>
	public class DefaultSeleneseCommand : ISeleneseCommand
	{
		private static readonly string PARSE_ERROR_MESSAGE = "Command string must contain 4 pipe characters and should start with a '|'. Unable to parse command string";
		private readonly string argument2;
		private readonly string argument1;
		private readonly string command;

		public DefaultSeleneseCommand(string command, string argument1, string argument2)
		{
			this.command = command;
			this.argument1 = argument1;
			this.argument2 = argument2;
		}

		public string CommandString
		{
			get {return "|" + command + "|" + argument1 + "|" + argument2 + "|";}
		}
		
		public string Command
		{
			get { return command; }
		}

		public string Argument1
		{
			get { return argument1; }
		}

		public string Argument2
		{
			get { return argument2; }
		}

		public static DefaultSeleneseCommand Parse(string commandString)
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
			
			return new DefaultSeleneseCommand(commandArray[1], commandArray[2], commandArray[3]);
		}
	}
}
