using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Collections;
using System.Text;
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

		public string DoCommand(string command, string[] args)
		{
			ISeleneseCommand seleneseCommand = new DefaultSeleneseCommand(command, args);
			using (HttpWebResponse response = (HttpWebResponse) CreateWebRequest(seleneseCommand).GetResponse())
			{
				if (response.StatusCode != HttpStatusCode.OK)
				{
					throw new SeleniumException(response.StatusDescription);
				}
				string resultBody = ReadResponse(response);
				if (!resultBody.StartsWith("OK"))
				{
					throw new SeleniumException(resultBody);
				}
				return resultBody;

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
			string result = url + "?" + commandString;
			if (sessionId != null)
			{
				result += "&sessionId=" + sessionId;
			}
			return result;
		}

		public void Start() 
		{
			string result = GetString("getNewBrowserSession", new String[] {browserStartCommand, browserURL});
			sessionId = result;
        
		}

		public void Stop() 
		{
			DoCommand("testComplete", null);
			sessionId = null;
		}

		public String GetString(String commandName, String[] args) 
		{
			return DoCommand(commandName, args).Substring(3); // skip "OK,"
		}

		public String[] GetStringArray(String commandName, String[] args)
		{
			String result = GetString(commandName, args);
			return parseCSV(result);
		}

		/// <summary>
		/// Parse Selenium comma separated values.
		/// </summary>
		/// <param name="input">the comma delimited string to parse</param>
		/// <returns>the parsed comma-separated entries</returns>
		public static String[] parseCSV(String input) 
		{
			ArrayList output = new ArrayList();
			StringBuilder sb = new StringBuilder();
			for(int i = 0; i < input.Length; i++) 
			{
				char c = input.ToCharArray()[i];
				switch (c) 
				{
					case ',':
						output.Add(sb.ToString());
						sb = new StringBuilder();
						continue;
					case '\\':
						i++;
						c = input.ToCharArray()[i];
						sb.Append(c);
						continue;
					default:
						sb.Append(c);
						break;
				}  
			}
			output.Add(sb.ToString());
			return (String[]) output.ToArray(typeof(String));
		}

		public Decimal GetNumber(String commandName, String[] args)
		{
			String result = GetString(commandName, args);
			Decimal d = Decimal.Parse(result);
			return d;
		}

		public Decimal[] GetNumberArray(String commandName, String[] args)
		{
			String[] result = GetStringArray(commandName, args);
			Decimal[] d = new Decimal[result.Length];
			for (int i = 0; i < result.Length; i++)
			{
				d[i] = Decimal.Parse(result[i]);
			}
			return d;
		}

		public bool GetBoolean(String commandName, String[] args)
		{
			String result = GetString(commandName, args);
			bool b;
			if ("true".Equals(result)) 
			{
				b = true;
				return b;
			}
			if ("false".Equals(result)) 
			{
				b = false;
				return b;
			}
			throw new Exception("result was neither 'true' nor 'false': " + result);
		}

		public bool[] GetBooleanArray(String commandName, String[] args)
		{
			String[] result = GetStringArray(commandName, args);
			bool[] b = new bool[result.Length];
			for (int i = 0; i < result.Length; i++)
			{
				if ("true".Equals(result)) 
				{
					b[i] = true;
					continue;
				}
				if ("false".Equals(result)) 
				{
					b[i] = false;
					continue;
				}
				throw new Exception("result was neither 'true' nor 'false': " + result);
			}
			return b;
		}

	}
}
