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
using System.IO;
using System.Net;
using System.Threading;
using System.Collections;
using System.Text;
using Selenium;

namespace Selenium
{
	/// <summary>
	/// Sends commands and retrieves results via HTTP.
	/// </summary>
	public class HttpCommandProcessor : ICommandProcessor
	{
		private readonly string url;
		private string sessionId;
		private string browserStartCommand;
		private string browserURL;
        private string extensionJs;
		
		/// <summary>
		/// The server URL, to whom we send command requests
		/// </summary>
		public string Url
		{
			get { return url; }
		}

		/// <summary>
		/// Specifies a server host/port, a command to launch the browser, and a starting URL for the browser.
		/// </summary>
		/// <param name="serverHost">the host name on which the Selenium Server resides</param>
		/// <param name="serverPort">the port on which the Selenium Server is listening</param>
		/// <param name="browserStartCommand">the command string used to launch the browser, e.g. "*firefox" or "c:\\program files\\internet explorer\\iexplore.exe"</param>
		/// <param name="browserURL">the starting URL including just a domain name.  We'll start the browser pointing at the Selenium resources on this URL,
		/// e.g. "http://www.google.com" would send the browser to "http://www.google.com/selenium-server/RemoteRunner.html"</param>
		public HttpCommandProcessor(string serverHost, int serverPort, string browserStartCommand, string browserURL) 
		{
			this.url = "http://" + serverHost + 
				":"+ serverPort + "/selenium-server/driver/";
			this.browserStartCommand = browserStartCommand;
			this.browserURL = browserURL;
			this.extensionJs = "";
		}

		/// <summary>
		/// Specifies the URL to the server, a command to launch the browser, and a starting URL for the browser.
		/// </summary>
		/// <param name="serverURL">the URL of the Selenium Server Driver, e.g. "http://localhost:4444/selenium-server/driver/" (don't forget the final slash!)</param>
		/// <param name="browserStartCommand">the command string used to launch the browser, e.g. "*firefox" or "c:\\program files\\internet explorer\\iexplore.exe"</param>
		/// <param name="browserURL">the starting URL including just a domain name.  We'll start the browser pointing at the Selenium resources on this URL,
		/// e.g. "http://www.google.com" would send the browser to "http://www.google.com/selenium-server/RemoteRunner.html"</param>
		public HttpCommandProcessor(string serverURL, string browserStartCommand, string browserURL) 
		{
			this.url = serverURL;
			this.browserStartCommand = browserStartCommand;
			this.browserURL = browserURL;
			this.extensionJs = "";
		}

		/// <summary>
		/// Send the specified remote command to the browser to be performed
		/// </summary>
		/// <param name="command">the remote command verb</param>
		/// <param name="args">the arguments to the remote command (depends on the verb)</param>
		/// <returns>the command result, defined by the remote JavaScript.  "getX" style
		///		commands may return data from the browser</returns>
		public string DoCommand(string command, string[] args)
		{
			IRemoteCommand remoteCommand = new DefaultRemoteCommand(command, args);
			using (HttpWebResponse response = (HttpWebResponse) CreateWebRequest(remoteCommand).GetResponse())
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

		/// <summary>
		/// Retrieves the body of the HTTP response
		/// </summary>
		/// <param name="response">the response object to read</param>
		/// <returns>the body of the HTTP response</returns>
		public virtual string ReadResponse(HttpWebResponse response)
		{
			using (StreamReader reader = new StreamReader(response.GetResponseStream()))
			{
				return reader.ReadToEnd();
			}
		}

        /// <summary>
        /// Builds an HTTP request based on the specified remote Command
        /// </summary>
        /// <param name="command">the command we'll send to the server</param>
        /// <returns>an HTTP request, which will perform this command</returns>
        public virtual WebRequest CreateWebRequest(IRemoteCommand command)
        {
            byte[] data = BuildCommandPostData(command.CommandString);
            
            HttpWebRequest request = (HttpWebRequest) WebRequest.Create(url);
            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded; charset=utf-8";
            request.Timeout = Timeout.Infinite;
            
            Stream rs = request.GetRequestStream();
            rs.Write(data, 0, data.Length);
            rs.Close();
            
            return request;
        }

        private byte[] BuildCommandPostData(string commandString)
        {
            string data = commandString;
            if (sessionId != null)
            {
                data += "&sessionId=" + sessionId;
            }
            return (new UTF8Encoding()).GetBytes(data);
        }

        /// <summary>
        /// Sets the extension Javascript to be used in the created session
        /// </summary>
        public void SetExtensionJs(string extensionJs) 
        {
            this.extensionJs = extensionJs;
        }

		/// <summary>
		/// Creates a new browser session
		/// </summary>
		public void Start() 
		{
			string result = GetString("getNewBrowserSession", new String[] {browserStartCommand, browserURL, extensionJs});
			sessionId = result;
		}

		/// <summary>
		/// Stops the previous browser session, killing the browser
		/// </summary>
		public void Stop() 
		{
			DoCommand("testComplete", null);
			sessionId = null;
		}

		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="commandName">the remote Command verb</param>
		/// <param name="args">the arguments to the remote Command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		public String GetString(String commandName, String[] args) 
		{
			return DoCommand(commandName, args).Substring(3); // skip "OK,"
		}

		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="commandName">the remote Command verb</param>
		/// <param name="args">the arguments to the remote Command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
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

		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="commandName">the remote Command verb</param>
		/// <param name="args">the arguments to the remote Command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
		public Decimal GetNumber(String commandName, String[] args)
		{
			String result = GetString(commandName, args);
			Decimal d = Decimal.Parse(result);
			return d;
		}

		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="commandName">the remote Command verb</param>
		/// <param name="args">the arguments to the remote Command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
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

		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="commandName">the remote Command verb</param>
		/// <param name="args">the arguments to the remote Command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
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

		/// <summary>
		/// Runs the specified remote accessor (getter) command and returns the retrieved result
		/// </summary>
		/// <param name="commandName">the remote Command verb</param>
		/// <param name="args">the arguments to the remote Command (depends on the verb)</param>
		/// <returns>the result of running the accessor on the browser</returns>
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
