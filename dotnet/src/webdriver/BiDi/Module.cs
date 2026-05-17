// <copyright file="Module.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi;

public abstract class Module
{
    private Broker Broker { get; set; } = null!;

    private EventDispatcher EventDispatcher { get; set; } = null!;

    protected Task<TResult> ExecuteAsync<TParameters, TResult>(Command<TParameters, TResult> descriptor, TParameters @params, CommandOptions? options, CancellationToken cancellationToken)
        where TParameters : Parameters
        where TResult : EmptyResult
    {
        return Broker.ExecuteAsync(descriptor, @params, options, cancellationToken);
    }

    protected IEventSource<TEventArgs> CreateEventSource<TEventArgs>(EventDescriptor<TEventArgs> descriptor)
        where TEventArgs : EventArgs
    {
        return new EventSource<TEventArgs>(EventDispatcher, descriptor);
    }

    internal static TModule Create<TModule>(Broker broker, EventDispatcher eventDispatcher)
        where TModule : Module, new()
    {
        TModule module = new()
        {
            Broker = broker,
            EventDispatcher = eventDispatcher
        };

        return module;
    }
}
