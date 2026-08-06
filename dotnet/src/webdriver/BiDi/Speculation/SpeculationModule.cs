// <copyright file="SpeculationModule.cs" company="Selenium Committers">
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

using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Speculation;

internal sealed class SpeculationModule : Module, ISpeculationModule
{
    public IEventSource<PrefetchStatusUpdatedEventArgs> PrefetchStatusUpdated => _prefetchStatusUpdated ?? Interlocked.CompareExchange(ref _prefetchStatusUpdated, CreateEventSource(SpeculationEvent.PrefetchStatusUpdated), null) ?? _prefetchStatusUpdated;
    private IEventSource<PrefetchStatusUpdatedEventArgs>? _prefetchStatusUpdated;
}

[JsonSerializable(typeof(PrefetchStatusUpdatedEventArgs))]
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class SpeculationJsonSerializerContext : JsonSerializerContext;
