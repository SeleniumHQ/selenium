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

namespace OpenQA.Selenium.BiDi.BrowsingContext;

internal sealed class BrowsingContextLogModule(BrowsingContext context, ILogModule logModule) : IBrowsingContextLogModule
{
    public Task<Subscription> OnEntryAddedAsync(Func<EntryAddedEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return logModule.OnEntryAddedAsync(
            e => HandleEntryAddedAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    public Task<Subscription> OnEntryAddedAsync(Action<EntryAddedEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return logModule.OnEntryAddedAsync(
            e => HandleEntryAdded(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    private async Task HandleEntryAddedAsync(EntryAddedEventArgs e, Func<EntryAddedEventArgs, Task> handler)
    {
        if (context.Equals(e.Source.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleEntryAdded(EntryAddedEventArgs e, Action<EntryAddedEventArgs> handler)
    {
        if (context.Equals(e.Source.Context))
        {
            handler(e);
        }
    }
}
