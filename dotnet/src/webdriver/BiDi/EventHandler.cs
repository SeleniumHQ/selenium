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

    public abstract ValueTask InvokeAsync(EventParams args, IBiDi bidi);
}

internal class AsyncEventHandler<TEventArgs, TEventParams>(string eventName, Func<TEventArgs, Task> func, Func<IBiDi, TEventParams, TEventArgs> factory)
    : EventHandler(eventName)
    where TEventParams : EventParams
    where TEventArgs : EventArgs
{
    private readonly Func<TEventArgs, Task> _func = func ?? throw new ArgumentNullException(nameof(func), "Async event handler function cannot be null.");
    private readonly Func<IBiDi, TEventParams, TEventArgs> _factory = factory ?? throw new ArgumentNullException(nameof(factory), "Event args factory function cannot be null.");

    public override async ValueTask InvokeAsync(EventParams args, IBiDi bidi)
    {
        var eventArgs = _factory(bidi, (TEventParams)args);
        await _func(eventArgs).ConfigureAwait(false);
    }
}

internal class SyncEventHandler<TEventArgs, TEventParams>(string eventName, Action<TEventArgs> action, Func<IBiDi, TEventParams, TEventArgs> factory)
    : EventHandler(eventName)
    where TEventParams : EventParams
    where TEventArgs : EventArgs
{
    private readonly Action<TEventArgs> _action = action ?? throw new ArgumentNullException(nameof(action), "Sync event handler action cannot be null.");
    private readonly Func<IBiDi, TEventParams, TEventArgs> _factory = factory ?? throw new ArgumentNullException(nameof(factory), "Event args factory function cannot be null.");

    public override ValueTask InvokeAsync(EventParams args, IBiDi bidi)
    {
        var eventArgs = _factory(bidi, (TEventParams)args);
        _action(eventArgs);

        return default;
    }
}
