// <copyright file="SafariDriverConnection.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using Newtonsoft.Json;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Safari.Internal;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// Represents a connection to an instance of the Safari browser.
    /// </summary>
    public class SafariDriverConnection
    {
        private bool connectionClosed;
        private IWebSocketConnection connection;
        private Queue<SafariCommand> commandQueue = new Queue<SafariCommand>();
        private Queue<SafariResponseMessage> responseQueue = new Queue<SafariResponseMessage>();

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverConnection"/> class.
        /// </summary>
        /// <param name="connection">An <see cref="IWebSocketConnection"/> representing a 
        /// connection using the WebSockets protocol.</param>
        public SafariDriverConnection(IWebSocketConnection connection)
        {
            this.connection = connection;
            this.connection.MessageReceived += new EventHandler<TextMessageHandledEventArgs>(this.ConnectionMessageReceivedEventHandler);
            this.connection.Closed += new EventHandler<ConnectionEventArgs>(this.ConnectionClosedEventHandler);
        }

        /// <summary>
        /// Sends a command to the SafariDriver and waits for a response.
        /// </summary>
        /// <param name="command">The <see cref="Command"/> to send to the driver.</param>
        /// <returns>The <see cref="Response"/> from the command.</returns>
        public Response Send(Command command)
        {
            SafariCommand wrappedCommand = new SafariCommand(command);
            this.commandQueue.Enqueue(wrappedCommand);
            SafariCommandMessage wrapper = new SafariCommandMessage(wrappedCommand);
            string commandJson = JsonConvert.SerializeObject(wrapper);
            this.connection.Send(commandJson);
            return this.WaitForResponse(TimeSpan.FromSeconds(30));
        }

        private Response WaitForResponse(TimeSpan timeout)
        {
            bool timedOut = false;
            Response response = null;
            DateTime endTime = DateTime.Now.Add(timeout);
            while (response == null && !timedOut)
            {
                if (this.connectionClosed)
                {
                    response = new Response();
                    break;
                }
                else
                {
                    response = this.GetQueuedResponse();
                    if (response != null)
                    {
                        break;
                    }
                }

                Thread.Sleep(250);
                if (DateTime.Now > endTime)
                {
                    timedOut = true;
                }
            }

            if (timedOut)
            {
                Dictionary<string, object> valueDictionary = new Dictionary<string, object>();
                valueDictionary["message"] = "Timed out waiting for response from WebSocket server";
                response = new Response();
                response.Status = WebDriverResult.Timeout;
                response.Value = valueDictionary;
            }

            return response;
        }

        private Response GetQueuedResponse()
        {
            Response response = null;
            lock (this.responseQueue)
            {
                if (this.responseQueue.Count != 0)
                {
                    response = this.responseQueue.Dequeue().Response;
                }
            }

            return response;
        }

        private void ConnectionClosedEventHandler(object sender, ConnectionEventArgs e)
        {
            this.connectionClosed = true;
        }

        private void ConnectionMessageReceivedEventHandler(object sender, TextMessageHandledEventArgs e)
        {
            if (this.commandQueue.Count == 0)
            {
                return;
            }

            SafariResponseMessage response = SafariResponseMessage.FromJson(e.Message);
            if (this.commandQueue.Peek().Id != response.Id)
            {
                throw new WebDriverException("Unmatched command/response ID pair");
            }

            this.commandQueue.Dequeue();

            lock (this.responseQueue)
            {
                this.responseQueue.Enqueue(response);
            }
        }
    }
}
