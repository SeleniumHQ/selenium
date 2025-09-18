// <copyright file="SetClientWindowStateCommand.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Communication;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Browser;

internal class SetClientWindowStateCommand(SetClientWindowStateCommandParameters @params)
    : Command<SetClientWindowStateCommandParameters, ClientWindowInfo>(@params, "browser.setClientWindowState");

[JsonDerivedType(typeof(SetClientWindowNamedStateCommandParameters))]
[JsonDerivedType(typeof(SetClientWindowRectStateCommandParameters))]
internal abstract record SetClientWindowStateCommandParameters(ClientWindow ClientWindow) : Parameters;

internal record SetClientWindowNamedStateCommandParameters(ClientWindow ClientWindow, ClientWindowNamedState State) : SetClientWindowStateCommandParameters(ClientWindow);

internal record SetClientWindowRectStateCommandParameters(ClientWindow ClientWindow, [property: JsonIgnore] SetClientWindowRectStateOptions? Options) : SetClientWindowStateCommandParameters(ClientWindow)
{
    [JsonInclude]
    internal string State { get; } = "normal";

    public int? Width { get; set; } = Options?.Width;

    public int? Height { get; set; } = Options?.Height;

    public int? X { get; set; } = Options?.X;

    public int? Y { get; set; } = Options?.Y;
}

public sealed class SetClientWindowNamedStateOptions : CommandOptions;

public sealed class SetClientWindowRectStateOptions : CommandOptions
{
    public int? Width { get; set; }

    public int? Height { get; set; }

    public int? X { get; set; }

    public int? Y { get; set; }
}

public enum ClientWindowNamedState
{
    Fullscreen,
    Maximized,
    Minimized
}
