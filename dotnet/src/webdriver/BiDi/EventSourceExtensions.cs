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
    public static async IAsyncEnumerable<TEventArgs> When<TEventArgs>(
    this IEventSource<TEventArgs> source,
    Func<Task> action,
    [EnumeratorCancellation] CancellationToken cancellationToken = default)
    where TEventArgs : EventArgs
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(action);

        await using var stream = await source.ReadAllAsync(cancellationToken).ConfigureAwait(false);

        var actionTask = action();

        if (cancellationToken.CanBeCanceled && !actionTask.IsCompleted)
        {
            var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
            using (cancellationToken.Register(static s => ((TaskCompletionSource<bool>)s!).TrySetResult(true), tcs))
            {
                if (await Task.WhenAny(actionTask, tcs.Task).ConfigureAwait(false) == tcs.Task)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                }
            }
        }

        await actionTask.ConfigureAwait(false);

        await foreach (var item in stream.WithCancellation(cancellationToken).ConfigureAwait(false))
        {
            yield return item;
        }
    }
}
