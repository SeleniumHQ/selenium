using System;
using System.IO;
using System.Net;
using System.Threading;
using Selenium;

namespace Selenium
{
	/// <summary>
	/// Summary description for DefaultCommandProcessor.
	/// </summary>
	public class HttpCommandProcessor : ICommandProcessor
	{
		private readonly string url;
		private string sessionId;
		private string browserStartCommand;
		private string browserURL;

		public string Url
		{
			get { return url; }
		}

		public HttpCommandProcessor(string serverHost, int serverPort, string browserStartCommand, string browserURL) 
		{
			this.url = "http://" + serverHost + 
				":"+ serverPort + "/selenium-server/driver/";
			this.browserStartCommand = browserStartCommand;
			this.browserURL = browserURL;
		}

		public HttpCommandProcessor(string serverURL, string browserStartCommand, string browserURL) 
		{
			this.url = serverURL;
			this.browserStartCommand = browserStartCommand;
			this.browserURL = browserURL;
		}

		public string DoCommand(string command, string argument1, string argument2)
		{
			ISeleneseCommand seleneseCommand = new DefaultSeleneseCommand(command, argument1, argument2);
			using (HttpWebResponse response = (HttpWebResponse) CreateWebRequest(seleneseCommand).GetResponse())
			{
				if (response.StatusCode != HttpStatusCode.OK)
				{
					throw new SeleniumException(response.StatusDescription);
				}
				return ReadResponse(response);

			}
		}

		public virtual string ReadResponse(HttpWebResponse response)
		{
			using (StreamReader reader = new StreamReader(response.GetResponseStream()))
			{
				return reader.ReadToEnd();
			}
		}

		public virtual WebRequest CreateWebRequest(ISeleneseCommand command)
		{
			WebRequest request = WebRequest.Create(BuildCommandString(command.CommandString));
			request.Timeout = Timeout.Infinite;
			return request;
		}

		private string BuildCommandString(string commandString)
		{
			string result = url + "?commandRequest=" + commandString;
			if (sessionId != null)
			{
				result += "&sessionId=" + sessionId;
			}
			return result;
		}

		public void Start() 
		{
			string result = DoCommand("getNewBrowserSession", browserStartCommand, browserURL);
			long id;
			try 
			{
				// If the result isn't a long, it's probably an error message
				id = System.Convert.ToInt64(result);
			} 
			catch (Exception) 
			{
				throw new SeleniumException(result);
			}
			sessionId = System.Convert.ToString(id);
        
		}

		public void Stop() 
		{
			DoCommand("testComplete", "", "");
			sessionId = null;
		}


	}
}
