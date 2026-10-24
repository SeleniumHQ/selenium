// <copyright file="AccessibilitySnapshotter.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi;
using OpenQA.Selenium.BiDi.Script;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Internal.Logging;
using System.Text.Json;
using BiDiBrowsingContext = OpenQA.Selenium.BiDi.BrowsingContext.BrowsingContext;
using BrowsingContextInfo = OpenQA.Selenium.BiDi.BrowsingContext.Info;
using GetTreeOptions = OpenQA.Selenium.BiDi.BrowsingContext.GetTreeOptions;

namespace OpenQA.Selenium;

/// <summary>
/// Takes accessibility snapshots for one driver: runs the atom's wire entry in the sandbox realm
/// of each document over the driver's BiDi session and stitches child frames into the tree. The
/// atom hands the tree back as one JSON string beside the element and frame references, so this
/// class only maps references and recurses into frames.
/// </summary>
internal sealed class AccessibilitySnapshotter : IAsyncDisposable, IDisposable
{
    private static readonly ILogger _logger = Log.GetLogger<AccessibilitySnapshotter>();

    // The sandbox realm the atom runs in: page scripts cannot reach its prototypes.
    private const string Sandbox = "selenium";

    private const string StaleMessage = "the snapshot root is no longer attached to a document";

    private readonly WebDriver driver;
    private readonly SemaphoreSlim connecting = new SemaphoreSlim(1, 1);
    private IBiDi? bidi;
    private bool disposed;

    public AccessibilitySnapshotter(WebDriver driver)
    {
        this.driver = driver;
    }

    /// <summary>
    /// Snapshots the whole page, or the subtree under the element <paramref name="rootId"/> refers to.
    /// </summary>
    /// <param name="rootId">The reference of the element whose subtree to snapshot, or <see langword="null"/> for the page of the current window's top-level browsing context.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The snapshot, with every reachable child frame's tree attached under its <c>iframe</c> node.</returns>
    /// <exception cref="StaleElementReferenceException">When the root no longer belongs to a document.</exception>
    public async Task<AccessibilityNode> SnapshotAsync(string? rootId, CancellationToken cancellationToken)
    {
        IBiDi session = await this.SessionAsync(cancellationToken).ConfigureAwait(false);
        BiDiBrowsingContext top = new BiDiBrowsingContext(session, this.driver.CurrentWindowHandle);

        if (rootId is null)
        {
            return await this.SnapshotContextAsync(session, top, null, cancellationToken).ConfigureAwait(false)
                ?? throw new WebDriverException("accessibility snapshot: the script returned nothing");
        }

        // The element may live in any frame of the window. Chromium resolves its shared id only in
        // the document that owns it; Firefox resolves it in any document of the browsing context
        // group, so the atom checks ownership itself and each context is tried until the owner is
        // found.
        foreach (BiDiBrowsingContext context in await ContextsAsync(session, top, cancellationToken).ConfigureAwait(false))
        {
            try
            {
                AccessibilityNode? node = await this.SnapshotContextAsync(session, context, rootId, cancellationToken).ConfigureAwait(false);
                if (node is not null)
                {
                    return node;
                }
            }
            catch (NotOwnedException)
            {
                // Try the next context.
            }
        }

        throw new StaleElementReferenceException(StaleMessage);
    }

    public void Dispose()
    {
        this.DisposeAsync().AsTask().GetAwaiter().GetResult();
    }

    // Waits for a connection attempt in flight, so a snapshot that overlaps the driver's disposal
    // cannot leave its connection open, and never lets a close failure escape: the driver still has
    // its own session to quit.
    public async ValueTask DisposeAsync()
    {
        if (this.disposed)
        {
            return;
        }

        this.disposed = true;
        try
        {
            await this.connecting.WaitAsync().ConfigureAwait(false);
            IBiDi? session = this.bidi;
            this.bidi = null;
            if (session is not null)
            {
                await session.DisposeAsync().ConfigureAwait(false);
            }
        }
        catch (Exception e)
        {
            _logger.Debug("accessibility snapshot: closing the BiDi connection failed: " + e.Message);
        }
        finally
        {
            this.connecting.Dispose();
        }
    }

    // One BiDi connection per driver, opened on the first snapshot.
    private async Task<IBiDi> SessionAsync(CancellationToken cancellationToken)
    {
        await this.connecting.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            if (this.disposed)
            {
                throw new ObjectDisposedException(nameof(AccessibilitySnapshotter));
            }

            this.bidi ??= await this.driver.AsBiDiAsync(cancellationToken: cancellationToken).ConfigureAwait(false);
            return this.bidi;
        }
        finally
        {
            this.connecting.Release();
        }
    }

    // The snapshot of a context, or null when another document owns the root.
    private async Task<AccessibilityNode?> SnapshotContextAsync(IBiDi session, BiDiBrowsingContext context, string? rootId, CancellationToken cancellationToken)
    {
        ImmutableArray<LocalValue> arguments = rootId is null
            ? ImmutableArray<LocalValue>.Empty
            : ImmutableArray.Create<LocalValue>(new SharedReferenceLocalValue(rootId));

        RemoteValue result = await CallAsync(session, context, arguments, cancellationToken).ConfigureAwait(false);
        if (result is NullRemoteValue)
        {
            return null;
        }

        Dictionary<string, RemoteValue> fields = ObjectFields(result);
        if (fields.ContainsKey("error"))
        {
            // The only error the atom reports as data: the root left its document.
            throw new StaleElementReferenceException(StaleMessage);
        }

        List<IWebElement> elements = new List<IWebElement>();
        foreach (RemoteValue node in Items(Required(fields, "elements")))
        {
            elements.Add(this.driver.CreateElementFromReference(SharedId(node)));
        }

        List<BiDiBrowsingContext?> windows = new List<BiDiBrowsingContext?>();
        foreach (RemoteValue window in Items(Required(fields, "windows")))
        {
            windows.Add(ContextOf(window));
        }

        using JsonDocument document = JsonDocument.Parse(StringOf(Required(fields, "json")));
        return await this.FromWireAsync(
            document.RootElement,
            elements,
            index => this.StitchAsync(session, windows[index], cancellationToken)).ConfigureAwait(false);
    }

    // Builds the node tree from the atom's wire form: the node's fields, with "element" an index
    // into the elements and, on a frame node, "frame" an index the frame children callback
    // resolves to the frame's own tree.
    private async Task<AccessibilityNode> FromWireAsync(JsonElement data, IReadOnlyList<IWebElement> elements, Func<int, Task<IReadOnlyList<AccessibilityNode>>> frameChildren)
    {
        List<AccessibilityNode> children = new List<AccessibilityNode>();
        if (data.TryGetProperty("frame", out JsonElement frame))
        {
            children.AddRange(await frameChildren(frame.GetInt32()).ConfigureAwait(false));
        }
        else
        {
            foreach (JsonElement child in data.GetProperty("children").EnumerateArray())
            {
                children.Add(await this.FromWireAsync(child, elements, frameChildren).ConfigureAwait(false));
            }
        }

        Dictionary<string, object> states = new Dictionary<string, object>();
        foreach (JsonProperty state in data.GetProperty("states").EnumerateObject())
        {
            states[state.Name] = StateOf(state.Value);
        }

        return new AccessibilityNode(
            data.GetProperty("role").GetString() ?? string.Empty,
            data.GetProperty("name").GetString() ?? string.Empty,
            data.TryGetProperty("description", out JsonElement description) ? description.GetString() ?? string.Empty : string.Empty,
            data.TryGetProperty("value", out JsonElement value) ? value.GetString() : null,
            states,
            data.TryGetProperty("element", out JsonElement element) ? elements[element.GetInt32()] : null,
            children);
    }

    // Runs the atom's wire entry in the sandbox of the context; the remote value of its result.
    private static async Task<RemoteValue> CallAsync(IBiDi session, BiDiBrowsingContext context, ImmutableArray<LocalValue> arguments, CancellationToken cancellationToken)
    {
        CallFunctionOptions options = new CallFunctionOptions
        {
            Arguments = arguments,
            ResultOwnership = ResultOwnership.None,
            SerializationOptions = new SerializationOptions { MaxDomDepth = 0 },
        };

        EvaluateResult result;
        try
        {
            result = await session.Script.CallFunctionAsync(
                "(root) => (" + ResourceUtilities.AccessibilitySnapshotAtom + ")(root)",
                false,
                new ContextTarget(context) { Sandbox = Sandbox },
                options,
                cancellationToken).ConfigureAwait(false);
        }
        catch (BiDiException e) when (Mentions(e, "no such node"))
        {
            // The document of this context does not own the root's shared id, either because the
            // root lives in another frame or because its document is gone.
            throw new NotOwnedException(e);
        }

        if (result is EvaluateResultSuccess success)
        {
            return success.Result;
        }

        string text = result is EvaluateResultException failure ? failure.ExceptionDetails.Text : result.ToString()!;
        throw new WebDriverException("accessibility snapshot failed in the page: " + text);
    }

    // The document of a frame as the frame node's one child, or no children when unreachable.
    private async Task<IReadOnlyList<AccessibilityNode>> StitchAsync(IBiDi session, BiDiBrowsingContext? context, CancellationToken cancellationToken)
    {
        if (context is null)
        {
            return Array.Empty<AccessibilityNode>();
        }

        try
        {
            AccessibilityNode? document = await this.SnapshotContextAsync(session, context, null, cancellationToken).ConfigureAwait(false);
            return document is null ? Array.Empty<AccessibilityNode>() : new[] { document };
        }
        catch (Exception e) when (FrameUnreachable(e))
        {
            // Gone between discovery and the call, or mid-navigation: the frame stays a leaf.
            // Anything else is a real failure.
            _logger.Debug("accessibility snapshot: frame " + context.Id + " not reachable: " + e.Message);
            return Array.Empty<AccessibilityNode>();
        }
    }

    // The window's browsing contexts, top-level first, then each frame depth-first.
    private static async Task<List<BiDiBrowsingContext>> ContextsAsync(IBiDi session, BiDiBrowsingContext top, CancellationToken cancellationToken)
    {
        var tree = await session.BrowsingContext.GetTreeAsync(new GetTreeOptions { Root = top }, cancellationToken).ConfigureAwait(false);
        List<BiDiBrowsingContext> contexts = new List<BiDiBrowsingContext> { top };
        foreach (BrowsingContextInfo info in tree.Contexts)
        {
            Collect(info, top, contexts);
        }

        return contexts;
    }

    private static void Collect(BrowsingContextInfo info, BiDiBrowsingContext top, List<BiDiBrowsingContext> contexts)
    {
        if (info.Context.Id != top.Id)
        {
            contexts.Add(info.Context);
        }

        foreach (BrowsingContextInfo child in info.Children ?? ImmutableArray<BrowsingContextInfo>.Empty)
        {
            Collect(child, top, contexts);
        }
    }

    // Whether an error says a frame or its document is gone, rather than that a command failed.
    private static bool FrameUnreachable(Exception e)
    {
        return e is NotOwnedException || (e is BiDiException && (Mentions(e, "no such frame") || Mentions(e, "no such node")));
    }

    private static bool Mentions(Exception e, string text)
    {
        return e.Message is not null && e.Message.Contains(text);
    }

    private static Dictionary<string, RemoteValue> ObjectFields(RemoteValue value)
    {
        if (value is not ObjectRemoteValue obj)
        {
            throw new WebDriverException("accessibility snapshot: expected an object remote value, got " + value.GetType().Name);
        }

        Dictionary<string, RemoteValue> fields = new Dictionary<string, RemoteValue>();
        foreach (ImmutableArray<RemoteValue> pair in obj.Value ?? ImmutableArray<ImmutableArray<RemoteValue>>.Empty)
        {
            if (pair.Length != 2)
            {
                throw new WebDriverException("accessibility snapshot: expected object entries");
            }

            // A property name is written as a plain string, or as a string remote value.
            fields[StringOf(pair[0])] = pair[1];
        }

        return fields;
    }

    private static ImmutableArray<RemoteValue> Items(RemoteValue value)
    {
        if (value is not ArrayRemoteValue array)
        {
            throw new WebDriverException("accessibility snapshot: expected an array remote value, got " + value.GetType().Name);
        }

        return array.Value ?? ImmutableArray<RemoteValue>.Empty;
    }

    private static RemoteValue Required(Dictionary<string, RemoteValue> fields, string name)
    {
        if (!fields.TryGetValue(name, out RemoteValue? value))
        {
            throw new WebDriverException("accessibility snapshot: the result has no " + name);
        }

        return value;
    }

    private static string SharedId(RemoteValue value)
    {
        if (value is not NodeRemoteValue node || string.IsNullOrEmpty(node.SharedId))
        {
            throw new WebDriverException("accessibility snapshot: expected a node reference in the elements list");
        }

        return node.SharedId;
    }

    // The browsing context of a window remote value; null for a frame with no reachable context.
    private static BiDiBrowsingContext? ContextOf(RemoteValue value)
    {
        return value is WindowProxyRemoteValue window ? window.Value.Context : null;
    }

    private static string StringOf(RemoteValue value)
    {
        return value switch
        {
            StringRemoteValue s => s.Value,
            NullRemoteValue or UndefinedRemoteValue => string.Empty,
            _ => value.ToString() ?? string.Empty,
        };
    }

    private static object StateOf(JsonElement value)
    {
        return value.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Number => value.GetInt64(),
            _ => value.GetString() ?? string.Empty,
        };
    }

    // A shared id that the targeted document does not own.
    private sealed class NotOwnedException : Exception
    {
        public NotOwnedException(Exception cause)
            : base(cause.Message, cause)
        {
        }
    }
}
