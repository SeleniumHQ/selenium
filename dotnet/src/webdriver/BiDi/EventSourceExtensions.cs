// <copyright file="EventSourceExtensions.cs" company="Selenium Committers">
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

using System.Runtime.CompilerServices;

namespace OpenQA.Selenium.BiDi;

public static class EventSourceExtensions
{
    private static readonly TimeSpan DefaultTimeout = TimeSpan.FromSeconds(30);

    public static async IAsyncEnumerable<TEventArgs> When<TEventArgs>(
        this IEventSource<TEventArgs> source,
        Func<Task> action,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
        where TEventArgs : EventArgs
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(action);

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        if (!cancellationToken.CanBeCanceled)
        {
            cts.CancelAfter(DefaultTimeout);
        }

        await using var stream = await source.ReadAllAsync(cts.Token).ConfigureAwait(false);

        await action().ConfigureAwait(false);

        await foreach (var item in stream.WithCancellation(cts.Token).ConfigureAwait(false))
        {
            yield return item;
        }
    }
}
