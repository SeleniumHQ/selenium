// <copyright file="ChromiumNetworkConditions.cs" company="WebDriver Committers">
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
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Chromium
{
    /// <summary>
    /// Provides manipulation of getting and setting network conditions from Chromium.
    /// </summary>
    public class ChromiumNetworkConditions
    {
        private bool offline;
        private TimeSpan latency = TimeSpan.Zero;
        private long downloadThroughput = -1;
        private long uploadThroughput = -1;

        /// <summary>
        /// Gets or sets a value indicating whether the network is offline. Defaults to <see langword="false"/>.
        /// </summary>
        public bool IsOffline
        {
            get { return this.offline; }
            set { this.offline = value; }
        }

        /// <summary>
        /// Gets or sets the simulated latency of the connection. Typically given in milliseconds.
        /// </summary>
        public TimeSpan Latency
        {
            get { return this.latency; }
            set { this.latency = value; }
        }

        /// <summary>
        /// Gets or sets the throughput of the network connection in kb/second for downloading.
        /// </summary>
        public long DownloadThroughput
        {
            get { return this.downloadThroughput; }
            set { this.downloadThroughput = value; }
        }

        /// <summary>
        /// Gets or sets the throughput of the network connection in kb/second for uploading.
        /// </summary>
        public long UploadThroughput
        {
            get { return this.uploadThroughput; }
            set { this.uploadThroughput = value; }
        }

        static internal ChromiumNetworkConditions FromDictionary(Dictionary<string, object> dictionary)
        {
            ChromiumNetworkConditions conditions = new ChromiumNetworkConditions();
            if (dictionary.ContainsKey("offline"))
            {
                conditions.IsOffline = (bool)dictionary["offline"];
            }

            if (dictionary.ContainsKey("latency"))
            {
                conditions.Latency = TimeSpan.FromMilliseconds(Convert.ToDouble(dictionary["latency"]));
            }

            if (dictionary.ContainsKey("upload_throughput"))
            {
                conditions.UploadThroughput = (long)dictionary["upload_throughput"];
            }

            if (dictionary.ContainsKey("download_throughput"))
            {
                conditions.DownloadThroughput = (long)dictionary["download_throughput"];
            }

            return conditions;
        }

        internal Dictionary<string, object> ToDictionary()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary["offline"] = this.offline;
            if (this.latency != TimeSpan.Zero)
            {
                dictionary["latency"] = Convert.ToInt64(this.latency.TotalMilliseconds);
            }

            if (this.downloadThroughput >= 0)
            {
                dictionary["download_throughput"] = this.downloadThroughput;
            }

            if (this.uploadThroughput >= 0)
            {
                dictionary["upload_throughput"] = this.uploadThroughput;
            }

            return dictionary;
        }
    }
}
