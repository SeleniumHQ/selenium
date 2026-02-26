// <copyright file="Optional.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi;

public readonly record struct Optional<T>
{
    private readonly T _value;
    public bool HasValue { get; }

    public T Value => HasValue
        ? _value
        : throw new InvalidOperationException("Optional has no value. Check IsSet first.");

    public Optional(T value)
    {
        _value = value;
        HasValue = true;
    }

    public bool TryGetValue(out T value)
    {
        value = _value;
        return HasValue;
    }

    // implicit conversion from T -> Optional<T>
    public static implicit operator Optional<T>(T value) => new(value);
}
