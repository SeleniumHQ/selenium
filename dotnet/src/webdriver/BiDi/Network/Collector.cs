// <copyright file="Collector.cs" company="Selenium Committers">
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
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Network;

public sealed class Collector : IAsyncDisposable
{
    private readonly BiDi _bidi;

    internal Collector(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    internal string Id { get; }

    public async Task RemoveAsync()
    {
        await _bidi.Network.RemoveDataCollectorAsync(this).ConfigureAwait(false);
    }

    public async ValueTask DisposeAsync()
    {
        await RemoveAsync();
    }

    public override bool Equals(object? obj)
    {
        if (obj is Collector collectortObj) return collectortObj.Id == Id;

        return false;
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
}
