// <copyright file="ChromiumNetworkConditions.cs" company="Selenium Committers">
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
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.Chromium;

/// <summary>
/// Provides manipulation of getting and setting network conditions from Chromium.
/// </summary>
public class ChromiumNetworkConditions
{
    private long downloadThroughput = 0;
    private long uploadThroughput = 0;

    /// <summary>
    /// Gets or sets a value indicating whether the network is offline. Defaults to <see langword="false"/>.
    /// </summary>
    [JsonPropertyName("offline")]
    public bool IsOffline { get; set; }

    /// <summary>
    /// Gets or sets the simulated latency of the connection. Typically given in milliseconds.
    /// </summary>
    [JsonIgnore]
    public TimeSpan Latency { get; set; } = TimeSpan.Zero;

    /// <summary>
    /// Gets or sets the throughput of the network connection in bytes/second for downloading.
    /// </summary>
    [JsonPropertyName("download_throughput")]
    public long DownloadThroughput
    {
        get => this.downloadThroughput;
        set
        {
            if (value < 0)
            {
                throw new WebDriverException("Download throughput cannot be negative.");
            }

            this.downloadThroughput = value;
        }
    }

    /// <summary>
    /// Gets or sets the throughput of the network connection in bytes/second for uploading.
    /// </summary>
    [JsonPropertyName("upload_throughput")]
    public long UploadThroughput
    {
        get => this.uploadThroughput;
        set
        {
            if (value < 0)
            {
                throw new WebDriverException("Upload throughput cannot be negative.");
            }

            this.uploadThroughput = value;
        }
    }

    [JsonPropertyName("latency")]
    [JsonInclude]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    internal long? SerializableLatency => Convert.ToInt64(this.Latency.TotalMilliseconds);

    /// <summary>
    /// Creates a ChromiumNetworkConditions object from a dictionary of key-value pairs.
    /// </summary>
    /// <param name="dictionary">The dictionary to use to create the object.</param>
    /// <returns>The ChromiumNetworkConditions object created from the dictionary.</returns>
    public static ChromiumNetworkConditions FromDictionary(Dictionary<string, object?> dictionary)
    {
        ChromiumNetworkConditions conditions = new ChromiumNetworkConditions();
        if (dictionary.TryGetValue("offline", out object? offline))
        {
            conditions.IsOffline = (bool)offline!;
        }

        if (dictionary.TryGetValue("latency", out object? latency))
        {
            conditions.Latency = TimeSpan.FromMilliseconds(Convert.ToDouble(latency));
        }

        if (dictionary.TryGetValue("upload_throughput", out object? uploadThroughput))
        {
            conditions.UploadThroughput = (long)uploadThroughput!;
        }

        if (dictionary.TryGetValue("download_throughput", out object? downloadThroughput))
        {
            conditions.DownloadThroughput = (long)downloadThroughput!;
        }

        return conditions;
    }

    /// <summary>
    /// Sets the upload and download throughput properties to the same value.
    /// </summary>
    /// <param name="throughput">The throughput of the network connection in bytes/second for both upload and download.</param>
    /// <exception cref="ArgumentOutOfRangeException">If <paramref name="throughput"/> is negative.</exception>
    public void SetBidirectionalThroughput(long throughput)
    {
        if (throughput < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(throughput), "Throughput values cannot be negative.");
        }

        this.uploadThroughput = throughput;
        this.downloadThroughput = throughput;
    }
}
