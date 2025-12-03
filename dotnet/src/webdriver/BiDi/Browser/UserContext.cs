// <copyright file="UserContext.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Json.Converters;
using System;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Browser;

[JsonConverter(typeof(BrowserUserContextConverter))]
public sealed class UserContext : IEquatable<UserContext>, IAsyncDisposable
{
    private BiDi? _bidi;

    internal UserContext(string id)
    {
        Id = id;
    }

    internal string Id { get; }

    [JsonIgnore]
    public BiDi BiDi
    {
        get => _bidi ?? throw new InvalidOperationException($"{nameof(BiDi)} instance has not been hydrated.");
        internal set => _bidi = value;
    }

    public Task RemoveAsync()
    {
        return BiDi.Browser.RemoveUserContextAsync(this);
    }

    public async ValueTask DisposeAsync()
    {
        await RemoveAsync().ConfigureAwait(false);
    }

    public bool Equals(UserContext? other)
    {
        return other is not null && string.Equals(Id, other.Id, StringComparison.Ordinal);
    }


    public override bool Equals(object? obj)
    {
        return Equals(obj as UserContext);
    }

    public override int GetHashCode()
    {
        return StringComparer.Ordinal.GetHashCode(Id);
    }
}
