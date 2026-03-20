// <copyright file="BrowsingContextInputModule.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Input;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public sealed class BrowsingContextInputModule(BrowsingContext context, IInputModule inputModule) : IBrowsingContextInputModule
{
    public Task<PerformActionsResult> PerformActionsAsync(IEnumerable<SourceActions> actions, PerformActionsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return inputModule.PerformActionsAsync(context, actions, options, cancellationToken);
    }

    public Task<ReleaseActionsResult> ReleaseActionsAsync(ReleaseActionsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return inputModule.ReleaseActionsAsync(context, options, cancellationToken);
    }

    public Task<SetFilesResult> SetFilesAsync(Script.ISharedReference element, IEnumerable<string> files, SetFilesOptions? options = null, CancellationToken cancellationToken = default)
    {
        return inputModule.SetFilesAsync(context, element, files, options, cancellationToken);
    }

    public Task<Subscription> OnFileDialogOpenedAsync(Func<FileDialogEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return inputModule.OnFileDialogOpenedAsync(
            e => HandleFileDialogOpenedAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    public Task<Subscription> OnFileDialogOpenedAsync(Action<FileDialogEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return inputModule.OnFileDialogOpenedAsync(
            e => HandleFileDialogOpened(e, handler),
            ContextSubscriptionOptions.WithContext(options, context),
            cancellationToken);
    }

    private async Task HandleFileDialogOpenedAsync(FileDialogEventArgs e, Func<FileDialogEventArgs, Task> handler)
    {
        if (context.Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleFileDialogOpened(FileDialogEventArgs e, Action<FileDialogEventArgs> handler)
    {
        if (context.Equals(e.Context))
        {
            handler(e);
        }
    }
}
