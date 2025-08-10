// <copyright file="LogContextManager.cs" company="Selenium Committers">
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
using System.Diagnostics.CodeAnalysis;
using System.Threading;

namespace OpenQA.Selenium.Internal.Logging;

internal class LogContextManager
{
    private readonly AsyncLocal<ILogContext?> _currentAmbientLogContext = new();

    public LogContextManager()
    {
        var defaulLogHandler = new TextWriterHandler(Console.Error);

        GlobalContext = new LogContext(LogEventLevel.Warn, null, null, [defaulLogHandler]);
    }

    public ILogContext GlobalContext { get; }

    [AllowNull]
    public ILogContext CurrentContext
    {
        get => _currentAmbientLogContext.Value ?? GlobalContext;
        set => _currentAmbientLogContext.Value = value;
    }
}
