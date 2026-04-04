// <copyright file="EventHandler.cs" company="Selenium Committers">
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

internal abstract class EventHandler(string eventName)
{
    public string EventName { get; } = eventName;

    public abstract ValueTask InvokeAsync(EventParams args);
}

internal class AsyncEventHandler<TEventParams>(string eventName, Func<TEventParams, Task> func)
    : EventHandler(eventName) where TEventParams : EventParams
{
    private readonly Func<TEventParams, Task> _func = func ?? throw new ArgumentNullException(nameof(func), "Async event handler function cannot be null.");

    public override async ValueTask InvokeAsync(EventParams args)
    {
        await _func((TEventParams)args).ConfigureAwait(false);
    }
}

internal class SyncEventHandler<TEventParams>(string eventName, Action<TEventParams> action)
    : EventHandler(eventName) where TEventParams : EventParams
{
    private readonly Action<TEventParams> _action = action ?? throw new ArgumentNullException(nameof(action), "Sync event handler action cannot be null.");

    public override ValueTask InvokeAsync(EventParams args)
    {
        _action((TEventParams)args);

        return default;
    }
}
