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

namespace OpenQA.Selenium.BiDi;

public static class EventSourceExtensions
{
    public static async Task<TResult> ReadAllAsync<TEventArgs, TResult>(this IEventSource<TEventArgs> source, Func<IEventReader<TEventArgs>, Task<TResult>> action, CancellationToken cancellationToken = default)
        where TEventArgs : EventArgs
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(action);

        await using var reader = await source.ReadAllAsync(cancellationToken).ConfigureAwait(false);

        return await action(reader).ConfigureAwait(false);
    }

    public static async Task ReadAllAsync<TEventArgs>(this IEventSource<TEventArgs> source, Func<IEventReader<TEventArgs>, Task> action, CancellationToken cancellationToken = default)
        where TEventArgs : EventArgs
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(action);

        await using var reader = await source.ReadAllAsync(cancellationToken).ConfigureAwait(false);

        await action(reader).ConfigureAwait(false);
    }
}
