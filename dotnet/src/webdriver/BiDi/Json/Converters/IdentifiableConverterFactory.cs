// <copyright file="IdentifiableConverterFactory.cs" company="Selenium Committers">
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

using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Json.Converters;

internal sealed class IdentifiableConverterFactory : JsonConverterFactory
{
    private readonly Dictionary<Type, JsonConverter> _converters = new();

    internal IdentifiableConverterFactory Register<T>(Func<string, T> factory)
        where T : class, IIdentifiable
    {
        _converters[typeof(T)] = new IdentifiableConverter<T>(factory);
        return this;
    }

    public override bool CanConvert(Type typeToConvert)
    {
        return _converters.ContainsKey(typeToConvert);
    }

    public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        return _converters[typeToConvert];
    }
}
