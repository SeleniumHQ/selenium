using System;
using System.Web;
using System.Text;
namespace Selenium
{
	/// <summary>
	/// Summary description for DefaultSeleneseCommand.
	/// </summary>
	public class DefaultSeleneseCommand : ISeleneseCommand
	{
		private static readonly string PARSE_ERROR_MESSAGE = "Command string must contain 4 pipe characters and should start with a '|'. Unable to parse command string";
		private readonly string[] args;
		private readonly string command;

		public DefaultSeleneseCommand(string command, string[] args)
		{
			this.command = command;
			this.args = args;
		}

		public string CommandString
		{
			get
			{
				StringBuilder sb = new StringBuilder("cmd=");
				sb.Append(HttpUtility.UrlPathEncode(command));
				if (args == null) return sb.ToString();
				for (int i = 0; i < args.Length; i++)
				{
					sb.Append('&').Append((i+1).ToString()).Append('=').Append(HttpUtility.UrlPathEncode(args[i]));
				}
				return sb.ToString();
			}
		}
		
		public string Command
		{
			get { return command; }
		}

		public string[] Args
		{
			get { return args; }
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
			
			return new DefaultSeleneseCommand(commandArray[1], new String[] {commandArray[2], commandArray[3]});
		}
	}
}
