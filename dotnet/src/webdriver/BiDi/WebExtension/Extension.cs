// <copyright file="Extension.cs" company="Selenium Committers">
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

using System.Diagnostics.CodeAnalysis;
using System.Text;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.WebExtension;

[JsonConverter(typeof(Converter))]
public sealed record Extension : IIdentifiable
{
    public Extension(IBiDi bidi, string id)
    {
        BiDi = bidi ?? throw new ArgumentNullException(nameof(bidi));
        Id = id;
    }

    public string Id { get; }

    [JsonIgnore]
    public IBiDi BiDi { get; }

    public bool Equals(Extension? other)
    {
        return other is not null && string.Equals(Id, other.Id, StringComparison.Ordinal);
    }

    public override int GetHashCode()
    {
        return StringComparer.Ordinal.GetHashCode(Id);
    }

    [SuppressMessage("CodeQuality", "IDE0051", Justification = "Used by compiler-generated ToString()")]
    private bool PrintMembers(StringBuilder builder)
    {
        builder.Append($"Id = {Id}");
        return true;
    }

    public sealed class Converter : IdentifiableConverter<Extension>
    {
        protected override Extension Create(IBiDi bidi, string id) => new(bidi, id);
    }
}
