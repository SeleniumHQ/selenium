// <copyright file="WebSocketConnection.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
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
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Represents a connection to a WebDriver Bidi remote end.
    /// </summary>
    public class WebSocketConnection
    {
        private static readonly TimeSpan DefaultTimeout = TimeSpan.FromSeconds(10);
        private readonly CancellationTokenSource clientTokenSource = new CancellationTokenSource();
        private readonly TimeSpan startupTimeout;
        private readonly TimeSpan shutdownTimeout;
        private readonly int bufferSize = 4096;
        private Task dataReceiveTask;
        private bool isActive = false;
        private ClientWebSocket client = new ClientWebSocket();
        private readonly SemaphoreSlim sendMethodSemaphore = new SemaphoreSlim(1, 1);

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketConnection" /> class.
        /// </summary>
        public WebSocketConnection()
            : this(DefaultTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketConnection" /> class with a given startup timeout.
        /// </summary>
        /// <param name="startupTimeout">The timeout before throwing an error when starting up the connection.</param>
        public WebSocketConnection(TimeSpan startupTimeout)
            : this(startupTimeout, DefaultTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketConnection" /> class with a given startup and shutdown timeout.
        /// </summary>
        /// <param name="startupTimeout">The timeout before throwing an error when starting up the connection.</param>
        /// <param name="shutdownTimeout">The timeout before throwing an error when shutting down the connection.</param>
        public WebSocketConnection(TimeSpan startupTimeout, TimeSpan shutdownTimeout)
        {
            this.startupTimeout = startupTimeout;
            this.shutdownTimeout = shutdownTimeout;
        }

        /// <summary>
        /// Occurs when data is received from this connection.
        /// </summary>
        public event EventHandler<WebSocketConnectionDataReceivedEventArgs> DataReceived;

        /// <summary>
        /// Occurs when a log message is emitted from this connection.
        /// </summary>
        public event EventHandler<DevToolsSessionLogMessageEventArgs> LogMessage;

        /// <summary>
        /// Gets a value indicating whether this connection is active.
        /// </summary>
        public bool IsActive => this.isActive;

        /// <summary>
        /// Gets the buffer size for communication used by this connection.
        /// </summary>
        public int BufferSize => this.bufferSize;

        /// <summary>
        /// Asynchronously starts communication with the remote end of this connection.
        /// </summary>
        /// <param name="url">The URL used to connect to the remote end.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        /// <exception cref="TimeoutException">Thrown when the connection is not established within the startup timeout.</exception>
        public virtual async Task Start(string url)
        {
            this.Log($"Opening connection to URL {url}", DevToolsSessionLogLevel.Trace);
            bool connected = false;
            DateTime timeout = DateTime.Now.Add(this.startupTimeout);
            while (!connected && DateTime.Now <= timeout)
            {
                try
                {
                    await this.client.ConnectAsync(new Uri(url), this.clientTokenSource.Token);
                    connected = true;
                }
                catch (WebSocketException)
                {
                    // If the server-side socket is not yet ready, it leaves the client socket in a closed state,
                    // which sees the object as disposed, so we must create a new one to try again
                    await Task.Delay(TimeSpan.FromMilliseconds(500));
                    this.client = new ClientWebSocket();
                }
            }

            if (!connected)
            {
                throw new TimeoutException($"Could not connect to browser within {this.startupTimeout.TotalSeconds} seconds");
            }

            this.dataReceiveTask = Task.Run(async () => await this.ReceiveData());
            this.isActive = true;
            this.Log($"Connection opened", DevToolsSessionLogLevel.Trace);
        }

        /// <summary>
        /// Asynchronously stops communication with the remote end of this connection.
        /// </summary>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public virtual async Task Stop()
        {
            this.Log($"Closing connection", DevToolsSessionLogLevel.Trace);
            if (this.client.State != WebSocketState.Open)
            {
                this.Log($"Socket already closed (Socket state: {this.client.State})");
            }
            else
            {
                await this.CloseClientWebSocket();
            }

            // Whether we closed the socket or timed out, we cancel the token causing ReceiveAsync to abort the socket.
            // The finally block at the end of the processing loop will dispose of the ClientWebSocket object.
            this.clientTokenSource.Cancel();
            if (this.dataReceiveTask != null)
            {
                await this.dataReceiveTask;
            }

            this.client.Dispose();
        }

        /// <summary>
        /// Asynchronously sends data to the remote end of this connection.
        /// </summary>
        /// <param name="data">The data to be sent to the remote end of this connection.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public virtual async Task SendData(string data)
        {
            ArraySegment<byte> messageBuffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(data));
            this.Log($"SEND >>> {data}");

            await sendMethodSemaphore.WaitAsync().ConfigureAwait(false);

            try
            {
                await this.client.SendAsync(messageBuffer, WebSocketMessageType.Text, endOfMessage: true, CancellationToken.None);
            }
            finally
            {
                sendMethodSemaphore.Release();
            }
        }

        /// <summary>
        /// Asynchronously closes the client WebSocket.
        /// </summary>
        /// <returns>The task object representing the asynchronous operation.</returns>
        protected virtual async Task CloseClientWebSocket()
        {
            // Close the socket first, because ReceiveAsync leaves an invalid socket (state = aborted) when the token is cancelled
            CancellationTokenSource timeout = new CancellationTokenSource(this.shutdownTimeout);
            try
            {
                // After this, the socket state which change to CloseSent
                await this.client.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, "Closing", timeout.Token);

                // Now we wait for the server response, which will close the socket
                while (this.client.State != WebSocketState.Closed && this.client.State != WebSocketState.Aborted && !timeout.Token.IsCancellationRequested)
                {
                    // The loop may be too tight for the cancellation token to get triggered, so add a small delay
                    await Task.Delay(TimeSpan.FromMilliseconds(10));
                }

                this.Log($"Client state is {this.client.State}", DevToolsSessionLogLevel.Trace);
            }
            catch (OperationCanceledException)
            {
                // An OperationCanceledException is normal upon task/token cancellation, so disregard it
            }
            catch (WebSocketException e)
            {
                this.Log($"Unexpected error during attempt at close: {e.Message}", DevToolsSessionLogLevel.Error);
            }
        }

        /// <summary>
        /// Raises the DataReceived event.
        /// </summary>
        /// <param name="e">The event args used when raising the event.</param>
        protected virtual void OnDataReceived(WebSocketConnectionDataReceivedEventArgs e)
        {
            if (this.DataReceived != null)
            {
                this.DataReceived(this, e);
            }
        }

        /// <summary>
        /// Raises the LogMessage event.
        /// </summary>
        /// <param name="e">The event args used when raising the event.</param>
        protected virtual void OnLogMessage(DevToolsSessionLogMessageEventArgs e)
        {
            if (this.LogMessage != null)
            {
                this.LogMessage(this, e);
            }
        }

        private async Task ReceiveData()
        {
            CancellationToken cancellationToken = this.clientTokenSource.Token;
            try
            {
                StringBuilder messageBuilder = new StringBuilder();
                ArraySegment<byte> buffer = WebSocket.CreateClientBuffer(this.bufferSize, this.bufferSize);
                while (this.client.State != WebSocketState.Closed && !cancellationToken.IsCancellationRequested)
                {
                    WebSocketReceiveResult receiveResult = await this.client.ReceiveAsync(buffer, cancellationToken);

                    // If the token is cancelled while ReceiveAsync is blocking, the socket state changes to aborted and it can't be used
                    if (!cancellationToken.IsCancellationRequested)
                    {
                        // The server is notifying us that the connection will close, and we did
                        // not initiate the close; send acknowledgement
                        if (receiveResult.MessageType == WebSocketMessageType.Close && this.client.State != WebSocketState.Closed && this.client.State != WebSocketState.CloseSent)
                        {
                            this.Log($"Acknowledging Close frame received from server (client state: {this.client.State})", DevToolsSessionLogLevel.Trace);
                            await this.client.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, "Acknowledge Close frame", CancellationToken.None);
                        }

                        // Display text or binary data
                        if (this.client.State == WebSocketState.Open && receiveResult.MessageType != WebSocketMessageType.Close)
                        {
                            messageBuilder.Append(Encoding.UTF8.GetString(buffer.Array, 0, receiveResult.Count));
                            if (receiveResult.EndOfMessage)
                            {
                                string message = messageBuilder.ToString();
                                messageBuilder = new StringBuilder();
                                if (message.Length > 0)
                                {
                                    this.Log($"RECV <<< {message}");
                                    this.OnDataReceived(new WebSocketConnectionDataReceivedEventArgs(message));
                                }
                            }
                        }
                    }
                }

                this.Log($"Ending processing loop in state {this.client.State}", DevToolsSessionLogLevel.Trace);
            }
            catch (OperationCanceledException)
            {
                // An OperationCanceledException is normal upon task/token cancellation, so disregard it
            }
            catch (WebSocketException e)
            {
                this.Log($"Unexpected error during receive of data: {e.Message}", DevToolsSessionLogLevel.Error);
            }
            finally
            {
                this.isActive = false;
            }
        }

        private void Log(string message)
        {
            this.Log(message, DevToolsSessionLogLevel.Trace);
        }

        private void Log(string message, DevToolsSessionLogLevel level)
        {
            this.OnLogMessage(new DevToolsSessionLogMessageEventArgs(level, "[{0}] {1}", "Connection", message));
        }
    }
}
