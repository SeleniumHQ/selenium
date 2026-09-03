// <copyright file="EventDescriptor.cs" company="Selenium Committers">
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

using System.Text.Json.Serialization.Metadata;

namespace OpenQA.Selenium.BiDi;

public abstract class EventDescriptor
{
    public string Name { get; }

    internal abstract JsonTypeInfo? JsonTypeInfo { get; }

    private protected EventDescriptor(string name)
    {
        Name = name;
    }
}

public sealed class EventDescriptor<TEventArgs> : EventDescriptor
    where TEventArgs : EventArgs
{
    internal override JsonTypeInfo? JsonTypeInfo { get; }

    internal EventDescriptor(string name) : base(name) { }

    private EventDescriptor(string name, JsonTypeInfo<TEventArgs> jsonTypeInfo) : base(name)
    {
        JsonTypeInfo = jsonTypeInfo;
    }

    public static EventDescriptor<TEventArgs> Create(
        string name,
        JsonTypeInfo<TEventArgs> jsonTypeInfo)
    {
        return new(name, jsonTypeInfo);
    }
}
