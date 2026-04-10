// <copyright file="LogHandlerList.cs" company="Selenium Committers">
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

using System.Collections;

namespace OpenQA.Selenium.Internal.Logging;

/// <summary>
/// Represents a list of log handlers.
/// </summary>
/// <inheritdoc cref="ILogHandlerList"/>
internal sealed class LogHandlerList : ILogHandlerList
{
    private readonly ILogContext _logContext;
    private readonly object _lock = new();
    private volatile ILogHandler[] _handlers;

    public LogHandlerList(ILogContext logContext)
    {
        _logContext = logContext;
        _handlers = [];
    }

    public LogHandlerList(ILogContext logContext, IEnumerable<ILogHandler> handlers)
    {
        _logContext = logContext;
        _handlers = [.. handlers];
    }

    public ILogContext Add(ILogHandler handler)
    {
        lock (_lock)
        {
            _handlers = [.. _handlers, handler];
        }

        return _logContext;
    }

    public ILogContext Remove(ILogHandler handler)
    {
        lock (_lock)
        {
            _handlers = [.. _handlers.Where(h => h != handler)];
        }

        return _logContext;
    }

    public ILogContext Clear()
    {
        lock (_lock)
        {
            _handlers = [];
        }

        return _logContext;
    }

    public IEnumerator<ILogHandler> GetEnumerator() => ((IEnumerable<ILogHandler>)_handlers).GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => _handlers.GetEnumerator();
}
