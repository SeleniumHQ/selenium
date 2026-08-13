// <copyright file="EventStreamExtensions.cs" company="Selenium Committers">
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

public static class EventStreamExtensions
{
    /// <summary>
    /// Configures how awaits on the tasks returned from an iteration of the event stream are performed.
    /// </summary>
    /// <remarks>
    /// <para>
    /// <see cref="IEventStream{TEventArgs}"/> implements both <see cref="IAsyncEnumerable{T}"/> and
    /// <see cref="IAsyncDisposable"/>, which makes a plain <c>.ConfigureAwait(bool)</c> call ambiguous
    /// (CS0121) because <c>TaskAsyncEnumerableExtensions</c> provides an overload for each interface.
    /// This extension method resolves the ambiguity by explicitly routing to the
    /// <see cref="IAsyncEnumerable{T}"/> overload, which is the behavior callers need when using
    /// <c>await foreach</c>.
    /// </para>
    /// </remarks>
    /// <typeparam name="TEventArgs">The event-args type produced by the stream.</typeparam>
    /// <param name="stream">The event stream to configure.</param>
    /// <param name="continueOnCapturedContext">
    /// <see langword="true"/> to capture and marshal continuation back to the original context;
    /// <see langword="false"/> to continue on a thread-pool thread.
    /// </param>
    /// <returns>A configured enumerable that applies the specified context-capture behavior.</returns>
    public static ConfiguredCancelableAsyncEnumerable<TEventArgs> ConfigureAwait<TEventArgs>(
        this IEventStream<TEventArgs> stream,
        bool continueOnCapturedContext)
        where TEventArgs : EventArgs
        => ((IAsyncEnumerable<TEventArgs>)stream).ConfigureAwait(continueOnCapturedContext);
}
