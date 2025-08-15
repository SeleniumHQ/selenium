// <copyright file="InstallCommand.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.WebExtension;

internal sealed class InstallCommand(InstallParameters @params)
    : Command<InstallParameters, InstallResult>(@params, "webExtension.install");

internal sealed record InstallParameters(ExtensionData ExtensionData) : Parameters;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(ExtensionArchivePath), "archivePath")]
[JsonDerivedType(typeof(ExtensionBase64Encoded), "base64")]
[JsonDerivedType(typeof(ExtensionPath), "path")]
public abstract record ExtensionData;

public sealed record ExtensionArchivePath(string Path) : ExtensionData;

public sealed record ExtensionBase64Encoded(string Value) : ExtensionData;

public sealed record ExtensionPath(string Path) : ExtensionData;

public sealed class InstallOptions : CommandOptions;

public sealed record InstallResult(Extension Extension) : EmptyResult;
