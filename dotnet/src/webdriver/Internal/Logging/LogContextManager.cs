// <copyright file="LogContextManager.cs" company="WebDriver Committers">
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

using System.Threading;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class LogContextManager
    {
        private readonly ILogContext _globalLogContext;

        private readonly AsyncLocal<ILogContext> _currentAmbientLogContext = new AsyncLocal<ILogContext>();

        public LogContextManager()
        {
            var defaulConsoleLogHandler = new ConsoleLogHandler();

            _globalLogContext = new LogContext(LogEventLevel.Info, null, null, new[] { defaulConsoleLogHandler });
        }

        public ILogContext GlobalContext
        {
            get { return _globalLogContext; }
        }

        public ILogContext CurrentContext
        {
            get
            {
                if (_currentAmbientLogContext.Value is null)
                {
                    return _globalLogContext;
                }
                else
                {
                    return _currentAmbientLogContext.Value;
                }
            }
            set
            {
                _currentAmbientLogContext.Value = value;
            }
        }
    }
}
