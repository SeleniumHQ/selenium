// <copyright file="V85Log.cs" company="WebDriver Committers">
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

using OpenQA.Selenium.DevTools.V85.Log;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools.V85
{
    /// <summary>
    /// Class containing the browser's log as referenced by version 86 of the DevTools Protocol.
    /// </summary>
    public class V85Log : DevTools.Log
    {
        private LogAdapter adapter;

        /// <summary>
        /// Initializes a new instance of the <see cref="V85Log"/> class.
        /// </summary>
        /// <param name="adapter">The adapter for the Log domain.</param>
        public V85Log(LogAdapter adapter)
        {
            this.adapter = adapter;
            this.adapter.EntryAdded += OnAdapterEntryAdded;
        }

        /// <summary>
        /// Asynchronously enables manipulation of the browser's log.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task Enable()
        {
            await adapter.Enable().ConfigureAwait(false);
        }

        /// <summary>
        /// Asynchronously disables manipulation of the browser's log.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task Disable()
        {
            await adapter.Disable().ConfigureAwait(false);
        }

        /// <summary>
        /// Asynchronously clears the browser's log.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task Clear()
        {
            await adapter.Clear().ConfigureAwait(false);
        }

        private void OnAdapterEntryAdded(object sender, Log.EntryAddedEventArgs e)
        {
            EntryAddedEventArgs propagated = new EntryAddedEventArgs();
            propagated.Entry = new LogEntry();
            propagated.Entry.Kind = e.Entry.Source.ToString();
            propagated.Entry.Message = e.Entry.Text;
            this.OnEntryAdded(propagated);
        }
    }
}
