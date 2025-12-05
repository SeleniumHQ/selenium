// <copyright file="BrowsingContextLogModule.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Log;
using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public sealed class BrowsingContextLogModule(BrowsingContext context, LogModule logModule)
{
    public Task<Subscription> OnEntryAddedAsync(Func<Log.LogEntry, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return logModule.OnEntryAddedAsync(async args =>
        {
            if (args.Source.Context?.Equals(context) is true)
            {
                await handler(args).ConfigureAwait(false);
            }
        }, new SubscriptionOptions() { Timeout = options?.Timeout }); // special case, don't scope to context, awaiting https://github.com/w3c/webdriver-bidi/issues/1032
    }

    public Task<Subscription> OnEntryAddedAsync(Action<Log.LogEntry> handler, ContextSubscriptionOptions? options = null)
    {
        return logModule.OnEntryAddedAsync(args =>
        {
            if (args.Source.Context?.Equals(context) is true)
            {
                handler(args);
            }
        }, new SubscriptionOptions() { Timeout = options?.Timeout }); // special case, don't scope to context, awaiting https://github.com/w3c/webdriver-bidi/issues/1032
    }
}
