// <copyright file="LogContext.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.Internal.Logging
{
    /// <summary>
    /// Represents a logging context that provides methods for creating sub-contexts, retrieving loggers, emitting log messages, and configuring minimum log levels.
    /// </summary>
    /// <inheritdoc cref="ILogContext"/>
    internal class LogContext : ILogContext
    {
        private ConcurrentDictionary<Type, ILogger> _loggers;

        private LogEventLevel _level;

        private readonly ILogContext _parentLogContext;

        public LogContext(LogEventLevel level, ILogContext parentLogContext, ConcurrentDictionary<Type, ILogger> loggers, ILogHandlerList handlers)
        {
            _level = level;

            _parentLogContext = parentLogContext;

            _loggers = loggers;

            Handlers = handlers ?? new LogHandlerList(this);
        }

        public ILogContext CreateContext()
        {
            return CreateContext(_level);
        }

        public ILogContext CreateContext(LogEventLevel minimumLevel)
        {
            ConcurrentDictionary<Type, ILogger> loggers = null;

            if (_loggers != null)
            {
                loggers = new ConcurrentDictionary<Type, ILogger>(_loggers.Select(l => new KeyValuePair<Type, ILogger>(l.Key, new Logger(l.Value.Issuer, minimumLevel))));
            }

            IList<ILogHandler> handlers = null;

            if (Handlers != null)
            {
                handlers = new List<ILogHandler>(Handlers.Select(h => h.Clone()));
            }
            else
            {
                handlers = new List<ILogHandler>();
            }

            var context = new LogContext(minimumLevel, this, loggers, Handlers);

            Log.CurrentContext = context;

            return context;
        }

        public ILogger GetLogger<T>()
        {
            return GetLogger(typeof(T));
        }

        public ILogger GetLogger(Type type)
        {
            if (type == null)
            {
                throw new ArgumentNullException(nameof(type));
            }

            if (_loggers is null)
            {
                _loggers = new ConcurrentDictionary<Type, ILogger>();
            }

            return _loggers.GetOrAdd(type, _ => new Logger(type, _level));
        }

        public void EmitMessage(ILogger logger, LogEventLevel level, string message)
        {
            if (Handlers != null && level >= _level && level >= GetLogger(logger.Issuer).Level)
            {
                var logEvent = new LogEvent(logger.Issuer, DateTimeOffset.Now, level, message);

                foreach (var handler in Handlers)
                {
                    handler.Handle(logEvent);
                }
            }
        }

        public ILogContext SetLevel(LogEventLevel level)
        {
            _level = level;

            if (_loggers != null)
            {
                foreach (var logger in _loggers.Values)
                {
                    logger.Level = _level;
                }
            }

            return this;
        }

        public ILogContext SetLevel(Type issuer, LogEventLevel level)
        {
            GetLogger(issuer).Level = level;

            return this;
        }

        public ILogHandlerList Handlers { get; }

        public void Dispose()
        {
            Log.CurrentContext = _parentLogContext;
        }
    }
}
