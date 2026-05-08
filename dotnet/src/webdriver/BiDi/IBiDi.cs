// <copyright file="IBiDi.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.ComponentModel;
using OpenQA.Selenium.BiDi.Browser;
using OpenQA.Selenium.BiDi.BrowsingContext;
using OpenQA.Selenium.BiDi.Emulation;
using OpenQA.Selenium.BiDi.Input;
using OpenQA.Selenium.BiDi.Log;
using OpenQA.Selenium.BiDi.Network;
using OpenQA.Selenium.BiDi.Script;
using OpenQA.Selenium.BiDi.Session;
using OpenQA.Selenium.BiDi.Storage;
using OpenQA.Selenium.BiDi.WebExtension;

namespace OpenQA.Selenium.BiDi;

public interface IBiDi : IAsyncDisposable
{
    IBrowserModule Browser { get; }

    IBrowsingContextModule BrowsingContext { get; }

    IEmulationModule Emulation { get; }

    IInputModule Input { get; }

    ILogModule Log { get; }

    INetworkModule Network { get; }

    IScriptModule Script { get; }

    IStorageModule Storage { get; }

    IWebExtensionModule WebExtension { get; }

    Task<StatusResult> StatusAsync(StatusOptions? options = null, CancellationToken cancellationToken = default);

    Task<NewResult> NewAsync(CapabilitiesRequest capabilities, NewOptions? options = null, CancellationToken cancellationToken = default);

    Task<EndResult> EndAsync(EndOptions? options = null, CancellationToken cancellationToken = default);

    Task<ISubscription> SubscribeAsync<TEventArgs>(EventDescriptor<TEventArgs> descriptor, Action<TEventArgs> handler, CancellationToken cancellationToken = default) where TEventArgs : EventArgs;

    Task<ISubscription> SubscribeAsync<TEventArgs>(EventDescriptor<TEventArgs> descriptor, Func<TEventArgs, Task> handler, CancellationToken cancellationToken = default) where TEventArgs : EventArgs;

    Task<ISubscription> SubscribeAsync<TEventArgs>(IEnumerable<EventDescriptor> descriptors, Action<TEventArgs> handler, CancellationToken cancellationToken = default) where TEventArgs : EventArgs;

    Task<ISubscription> SubscribeAsync<TEventArgs>(IEnumerable<EventDescriptor> descriptors, Func<TEventArgs, Task> handler, CancellationToken cancellationToken = default) where TEventArgs : EventArgs;

    Task<IEventStream<TEventArgs>> StreamAsync<TEventArgs>(EventDescriptor<TEventArgs> descriptor, CancellationToken cancellationToken = default) where TEventArgs : EventArgs;

    Task<IEventStream<TEventArgs>> StreamAsync<TEventArgs>(IEnumerable<EventDescriptor> descriptors, CancellationToken cancellationToken = default) where TEventArgs : EventArgs;

    [EditorBrowsable(EditorBrowsableState.Never)]
    T AsModule<T>() where T : Module, new();
}
