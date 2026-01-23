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

using System;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

public abstract class Module
{
    private Broker Broker { get; set; } = null!;

    protected Task<TResult> ExecuteCommandAsync<TCommand, TResult>(TCommand command, CommandOptions? options, JsonTypeInfo<TCommand> jsonCommandTypeInfo, JsonTypeInfo<TResult> jsonResultTypeInfo)
        where TCommand : Command
        where TResult : EmptyResult
    {
        return Broker.ExecuteCommandAsync(command, options, jsonCommandTypeInfo, jsonResultTypeInfo);
    }

    protected Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, Action<TEventArgs> action, SubscriptionOptions? options, JsonTypeInfo<TEventArgs> jsonTypeInfo)
        where TEventArgs : EventArgs
    {
        var eventHandler = new SyncEventHandler<TEventArgs>(eventName, action);
        return Broker.SubscribeAsync(eventName, eventHandler, options, jsonTypeInfo);
    }

    public Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, Func<TEventArgs, Task> func, SubscriptionOptions? options, JsonTypeInfo<TEventArgs> jsonTypeInfo)
        where TEventArgs : EventArgs
    {
        var eventHandler = new AsyncEventHandler<TEventArgs>(eventName, func);
        return Broker.SubscribeAsync(eventName, eventHandler, options, jsonTypeInfo);
    }

    protected abstract void Initialize(BiDi bidi, JsonSerializerOptions jsonSerializerOptions);

    internal static TModule Create<TModule>(BiDi bidi, Broker broker, JsonSerializerOptions jsonSerializerOptions)
        where TModule : Module, new()
    {
        TModule module = new()
        {
            Broker = broker
        };

        module.Initialize(bidi, jsonSerializerOptions);

        return module;
    }
}
