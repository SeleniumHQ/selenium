using ThoughtWorks.Selenium.Core;

namespace ThoughtWorks.Selenium.BridgeWebApp
{
	public class SeleneseQueue
	{

		private SingleEntryBlockingQueue requestHolder;
		private SingleEntryBlockingQueue resultHolder;

		public SeleneseQueue()
		{
			requestHolder = new SingleEntryBlockingQueue();
			resultHolder = new SingleEntryBlockingQueue();

		}

		public string ProcessCommandResultFromSelenium(string commandResult)
		{
			if (commandResult != null)
			{
				resultHolder.Put(commandResult);
			}

			return (string) requestHolder.Get();

		}

		public string ProcessCommandRequestFromClient(string commandRequest)
		{
			DefaultSeleneseCommand command = DefaultSeleneseCommand.Parse(commandRequest);

			requestHolder.Put(command.CommandString);
			if (!"testComplete".Equals(command.Command))
			{
				return (string) resultHolder.Get();
			}
			return "";

		}
	}
}
