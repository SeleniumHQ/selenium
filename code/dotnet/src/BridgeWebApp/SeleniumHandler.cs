using System.Text;
using System.Web;
using ThoughtWorks.Selenium.Core;

namespace ThoughtWorks.Selenium.BridgeWebApp
{
	public class SeleniumHandler : IHttpHandler
	{
		private SingleEntryBlockingQueue requestHolder;
		private SingleEntryBlockingQueue resultHolder;

		public SeleniumHandler()
		{
			requestHolder = new SingleEntryBlockingQueue();
			resultHolder = new SingleEntryBlockingQueue();
		}

		public bool IsReusable
		{
			get { return true; }
		}

		public void ProcessRequest(HttpContext context)
		{
			string commandRequest = context.Request.Params["commandRequest"];
			string commandResult = context.Request.Params["commandResult"];
			string seleniumStart = context.Request.Params["seleniumStart"];
			string returnValue = null;

			if (commandRequest != null)
			{
				returnValue = ProcessCommandRequestFromClient(DefaultSeleneseCommand.Parse(commandRequest).Command);
			}
			else if (commandResult != null || (seleniumStart != null && seleniumStart.Equals("true")))
			{
				returnValue = ProcessCommandResultFromSelenium(commandResult);
			}

			byte[] output = Encoding.Default.GetBytes(returnValue);
			context.Response.OutputStream.Write(output, 0, output.Length);
			
		}

		private string ProcessCommandResultFromSelenium(string commandResult)
		{
			if (commandResult != null)
			{
				resultHolder.Put(commandResult);
			}

			return (string) requestHolder.Get();

		}

		public string ProcessCommandRequestFromClient(string command)
		{
			requestHolder.Put(command);
			if (!command.Equals("testComplete"))
			{
				return (string) resultHolder.Get();
			}
			return "";

		}

	}
}