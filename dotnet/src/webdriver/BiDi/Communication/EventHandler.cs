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

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Communication;

public abstract class EventHandler(string eventName, Type eventArgsType, IEnumerable<BrowsingContext.BrowsingContext>? contexts = null)
{
    public string EventName { get; } = eventName;
    public Type EventArgsType { get; set; } = eventArgsType;
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; } = contexts;

    public abstract ValueTask InvokeAsync(object args);
}

internal class AsyncEventHandler<TEventArgs>(string eventName, Func<TEventArgs, Task> func, IEnumerable<BrowsingContext.BrowsingContext>? contexts = null)
    : EventHandler(eventName, typeof(TEventArgs), contexts) where TEventArgs : EventArgs
{
    private readonly Func<TEventArgs, Task> _func = func;

    public override async ValueTask InvokeAsync(object args)
    {
        await _func((TEventArgs)args).ConfigureAwait(false);
    }
}

internal class SyncEventHandler<TEventArgs>(string eventName, Action<TEventArgs> action, IEnumerable<BrowsingContext.BrowsingContext>? contexts = null)
    : EventHandler(eventName, typeof(TEventArgs), contexts) where TEventArgs : EventArgs
{
    private readonly Action<TEventArgs> _action = action;

    public override ValueTask InvokeAsync(object args)
    {
        _action((TEventArgs)args);

        return default;
    }
}
