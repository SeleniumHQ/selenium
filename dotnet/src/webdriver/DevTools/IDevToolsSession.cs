// <copyright file="IDevToolsSession.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Represents a WebSocket connection to a running DevTools instance that can be used to send 
    /// commands and recieve events.
    ///</summary>
    public interface IDevToolsSession : IDisposable
    {
        /// <summary>
        /// Event raised when the DevToolsSession logs informational messages.
        /// </summary>
        event EventHandler<DevToolsSessionLogMessageEventArgs> LogMessage;

        /// <summary>
        /// Event raised an event notification is received from the DevTools session.
        /// </summary>
        event EventHandler<DevToolsEventReceivedEventArgs> DevToolsEventReceived;

        /// <summary>
        /// Gets the domains that are valid for the specfied version of Developer Tools connection.
        /// </summary>
        /// <typeparam name="T">
        /// A <see cref="DevToolsSessionDomains"/> type specific to the version of Develoepr Tools with which to communicate.
        /// </typeparam>
        /// <returns>The version-specific domains for this Developer Tools connection.</returns>
        T GetVersionSpecificDomains<T>() where T : DevToolsSessionDomains;

        /// <summary>
        /// Sends the specified command and returns the associated command response.
        /// </summary>
        /// <typeparam name="TCommand">A command object implementing the <see cref="ICommand"/> interface.</typeparam>
        /// <param name="command">The command to be sent.</param>
        /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the command.</param>
        /// <param name="millisecondsTimeout">The execution timeout of the command in milliseconds.</param>
        /// <param name="throwExceptionIfResponseNotReceived"><see langword="true"/> to throw an exception if a response is not received; otherwise, <see langword="false"/>.</param>
        /// <returns>The command response object implementing the <see cref="ICommandResponse{T}"/> interface.</returns>
        Task<ICommandResponse<TCommand>> SendCommand<TCommand>(TCommand command, CancellationToken cancellationToken, int? millisecondsTimeout, bool throwExceptionIfResponseNotReceived)
            where TCommand : ICommand;

        /// <summary>
        /// Sends the specified command and returns the associated command response.
        /// </summary>
        /// <typeparam name="TCommand"></typeparam>
        /// <typeparam name="TCommandResponse"></typeparam>
        /// <typeparam name="TCommand">A command object implementing the <see cref="ICommand"/> interface.</typeparam>
        /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the command.</param>
        /// <param name="millisecondsTimeout">The execution timeout of the command in milliseconds.</param>
        /// <param name="throwExceptionIfResponseNotReceived"><see langword="true"/> to throw an exception if a response is not received; otherwise, <see langword="false"/>.</param>
        /// <returns>The command response object implementing the <see cref="ICommandResponse{T}"/> interface.</returns>
        Task<TCommandResponse> SendCommand<TCommand, TCommandResponse>(TCommand command, CancellationToken cancellationToken, int? millisecondsTimeout, bool throwExceptionIfResponseNotReceived)
            where TCommand : ICommand
            where TCommandResponse : ICommandResponse<TCommand>;

        /// <summary>
        /// Returns a JToken based on a command created with the specified command name and params.
        /// </summary>
        /// <param name="commandName">The name of the command to send.</param>
        /// <param name="params">The parameters of the command as a JToken object</param>
        /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the command.</param>
        /// <param name="millisecondsTimeout">The execution timeout of the command in milliseconds.</param>
        /// <param name="throwExceptionIfResponseNotReceived"><see langword="true"/> to throw an exception if a response is not received; otherwise, <see langword="false"/>.</param>
        /// <returns>The command response object implementing the <see cref="ICommandResponse{T}"/> interface.</returns>
        Task<JToken> SendCommand(string commandName, JToken @params, CancellationToken cancellationToken, int? millisecondsTimeout, bool throwExceptionIfResponseNotReceived);
    }
}
