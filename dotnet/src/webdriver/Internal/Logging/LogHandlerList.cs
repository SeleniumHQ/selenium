// <copyright file="LogHandlerList.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System.Collections.Generic;

namespace OpenQA.Selenium.Internal.Logging
{
    /// <summary>
    /// Represents a list of log handlers.
    /// </summary>
    /// <inheritdoc cref="ILogHandlerList"/>
    internal class LogHandlerList : List<ILogHandler>, ILogHandlerList
    {
        private readonly ILogContext _logContext;

        public LogHandlerList(ILogContext logContext)
        {
            _logContext = logContext;
        }

        public LogHandlerList(ILogContext logContext, IEnumerable<ILogHandler> handlers)
            : base(handlers)
        {
            _logContext = logContext;
        }

        public new ILogContext Add(ILogHandler handler)
        {
            base.Add(handler);

            return _logContext;
        }

        public new ILogContext Remove(ILogHandler handler)
        {
            base.Remove(handler);

            return _logContext;
        }

        public new ILogContext Clear()
        {
            base.Clear();

            return _logContext;
        }
    }
}
