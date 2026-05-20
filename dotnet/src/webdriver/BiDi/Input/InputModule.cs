// <copyright file="InputModule.cs" company="Selenium Committers">
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
using static OpenQA.Selenium.BiDi.Input.InputJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Input;

internal sealed class InputModule : Module, IInputModule
{
    private static readonly Command<PerformActionsParameters, PerformActionsResult> PerformActionsCommand = new(
        "input.performActions", Default.PerformActionsParameters, Default.PerformActionsResult);

    private static readonly Command<ReleaseActionsParameters, ReleaseActionsResult> ReleaseActionsCommand = new(
        "input.releaseActions", Default.ReleaseActionsParameters, Default.ReleaseActionsResult);

    private static readonly Command<SetFilesParameters, SetFilesResult> SetFilesCommand = new(
        "input.setFiles", Default.SetFilesParameters, Default.SetFilesResult);

    public async Task<PerformActionsResult> PerformActionsAsync(BrowsingContext.BrowsingContext context, ImmutableArray<SourceActions> actions, PerformActionsOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new PerformActionsParameters(context, actions);

        return await ExecuteAsync(PerformActionsCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ReleaseActionsResult> ReleaseActionsAsync(BrowsingContext.BrowsingContext context, ReleaseActionsOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ReleaseActionsParameters(context);

        return await ExecuteAsync(ReleaseActionsCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetFilesResult> SetFilesAsync(BrowsingContext.BrowsingContext context, Script.ISharedReference element, ImmutableArray<string> files, SetFilesOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetFilesParameters(context, element, files);

        return await ExecuteAsync(SetFilesCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public IEventSource<FileDialogOpenedEventArgs> FileDialogOpened => _fileDialogOpened ?? Interlocked.CompareExchange(ref _fileDialogOpened, CreateEventSource(InputEvent.FileDialogOpened), null) ?? _fileDialogOpened;
    private IEventSource<FileDialogOpenedEventArgs>? _fileDialogOpened;
}

[JsonSerializable(typeof(PerformActionsParameters))]
[JsonSerializable(typeof(PerformActionsResult))]
[JsonSerializable(typeof(ReleaseActionsParameters))]
[JsonSerializable(typeof(ReleaseActionsResult))]
[JsonSerializable(typeof(SetFilesParameters))]
[JsonSerializable(typeof(SetFilesResult))]

[JsonSerializable(typeof(FileDialogInfo))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class InputJsonSerializerContext : JsonSerializerContext;
