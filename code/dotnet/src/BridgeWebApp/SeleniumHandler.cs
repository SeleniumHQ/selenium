using System;
using System.Runtime.CompilerServices;
using System.Text;
using System.Web;

namespace ThoughtWorks.Selenium.BridgeWebApp
{
	public class SeleniumHandler : IHttpHandler
	{
		private static string SELENESE_QUEUE_KEY = "SeleneseQueue";

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
				returnValue = GetOrCreateQueue(context).ProcessCommandRequestFromClient(commandRequest);
			}
			else if (commandResult != null || (seleniumStart != null && seleniumStart.Equals("true")))
			{
				returnValue = GetOrCreateQueue(context).ProcessCommandResultFromSelenium(commandResult);
			}
			else
			{
				throw new ApplicationException("Invalid request received! No commandRequest or commandResult in request!");
			}

			byte[] output = Encoding.Default.GetBytes(returnValue);
			context.Response.OutputStream.Write(output, 0, output.Length);

		}

		private SeleneseQueue GetOrCreateQueue(HttpContext context)
		{
			SeleneseQueue queue = (SeleneseQueue) context.Application.Get(SELENESE_QUEUE_KEY);
			if (queue == null)
			{
				queue = new SeleneseQueue();
				context.Application.Add(SELENESE_QUEUE_KEY, queue);
			}
		
			return queue;
		}
	}
}
