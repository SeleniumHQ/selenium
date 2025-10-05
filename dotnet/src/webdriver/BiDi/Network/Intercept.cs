// <copyright file="Intercept.cs" company="Selenium Committers">
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
using System.Linq;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Network;

public sealed class Intercept : IAsyncDisposable
{
    private readonly BiDi _bidi;

    internal Intercept(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    internal string Id { get; }

    IList<Subscription> OnBeforeRequestSentSubscriptions { get; } = [];
    IList<Subscription> OnResponseStartedSubscriptions { get; } = [];
    IList<Subscription> OnAuthRequiredSubscriptions { get; } = [];

    public async Task RemoveAsync()
    {
        await _bidi.Network.RemoveInterceptAsync(this).ConfigureAwait(false);

        foreach (var subscription in OnBeforeRequestSentSubscriptions)
        {
            await subscription.UnsubscribeAsync().ConfigureAwait(false);
        }

        foreach (var subscription in OnResponseStartedSubscriptions)
        {
            await subscription.UnsubscribeAsync().ConfigureAwait(false);
        }

        foreach (var subscription in OnAuthRequiredSubscriptions)
        {
            await subscription.UnsubscribeAsync().ConfigureAwait(false);
        }
    }

    public async Task OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        var subscription = await _bidi.Network.OnBeforeRequestSentAsync(async args => await Filter(args, handler), options).ConfigureAwait(false);

        OnBeforeRequestSentSubscriptions.Add(subscription);
    }

    public async Task OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        var subscription = await _bidi.Network.OnResponseStartedAsync(async args => await Filter(args, handler), options).ConfigureAwait(false);

        OnResponseStartedSubscriptions.Add(subscription);
    }

    public async Task OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        var subscription = await _bidi.Network.OnAuthRequiredAsync(async args => await Filter(args, handler), options).ConfigureAwait(false);

        OnAuthRequiredSubscriptions.Add(subscription);
    }

    private async Task Filter(BeforeRequestSentEventArgs args, Func<BeforeRequestSentEventArgs, Task> handler)
    {
        if (args.Intercepts?.Contains(this) is true && args.IsBlocked)
        {
            await handler(args).ConfigureAwait(false);
        }
    }

    private async Task Filter(ResponseStartedEventArgs args, Func<ResponseStartedEventArgs, Task> handler)
    {
        if (args.Intercepts?.Contains(this) is true && args.IsBlocked)
        {
            await handler(args).ConfigureAwait(false);
        }
    }

    private async Task Filter(AuthRequiredEventArgs args, Func<AuthRequiredEventArgs, Task> handler)
    {
        if (args.Intercepts?.Contains(this) is true && args.IsBlocked)
        {
            await handler(args).ConfigureAwait(false);
        }
    }

    public async ValueTask DisposeAsync()
    {
        await RemoveAsync();
    }

    public override bool Equals(object? obj)
    {
        if (obj is Intercept interceptObj) return interceptObj.Id == Id;

        return false;
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
}
