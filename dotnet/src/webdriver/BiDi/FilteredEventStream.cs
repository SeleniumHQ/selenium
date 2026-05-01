// <copyright file="FilteredEventStream.cs" company="Selenium Committers">
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

internal sealed class FilteredEventStream<TEventArgs> : IEventStream<TEventArgs>
    where TEventArgs : EventArgs
{
    private readonly IEventStream<TEventArgs> _inner;
    private readonly Func<TEventArgs, bool> _predicate;

    public FilteredEventStream(IEventStream<TEventArgs> inner, Func<TEventArgs, bool> predicate)
    {
        _inner = inner;
        _predicate = predicate;
    }

    public async IAsyncEnumerator<TEventArgs> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        await foreach (var item in _inner.WithCancellation(cancellationToken).ConfigureAwait(false))
        {
            if (_predicate(item))
            {
                yield return item;
            }
        }
    }

    public ValueTask DisposeAsync()
    {
        return _inner.DisposeAsync();
    }
}
