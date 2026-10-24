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
using BiDiBrowsingContext = OpenQA.Selenium.BiDi.BrowsingContext.BrowsingContext;
using BrowsingContextInfo = OpenQA.Selenium.BiDi.BrowsingContext.Info;
using GetTreeOptions = OpenQA.Selenium.BiDi.BrowsingContext.GetTreeOptions;

namespace OpenQA.Selenium;

/// <summary>
/// Takes accessibility snapshots for one driver: installs the atom in the sandbox realm of each
/// document over the driver's BiDi session and stitches child frames into the tree.
/// </summary>
internal sealed class AccessibilitySnapshotter : IAsyncDisposable, IDisposable
{
    private static readonly ILogger _logger = Log.GetLogger<AccessibilitySnapshotter>();

    // The sandbox realm the atom runs in: page scripts cannot reach its prototypes.
    private const string Sandbox = "selenium";

    // Where the atom is kept inside the sandbox realm once installed.
    private const string Global = "__seleniumAccessibilitySnapshot";

    private const string StaleMessage = "the snapshot root is no longer attached to a document";

    private readonly WebDriver driver;
    private readonly SemaphoreSlim connecting = new SemaphoreSlim(1, 1);
    private IBiDi? bidi;
    private bool preloaded;

    public AccessibilitySnapshotter(WebDriver driver)
    {
        this.driver = driver;
    }

    /// <summary>
    /// Snapshots the whole page, or the subtree under <paramref name="root"/>.
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
        // group, so the script checks ownership itself and each context is tried until the owner is
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
        if (this.bidi is null)
        {
            return;
        }

        try
        {
            this.DisposeAsync().AsTask().GetAwaiter().GetResult();
        }
        catch (Exception e)
        {
            _logger.Debug("accessibility snapshot: closing the BiDi connection failed: " + e.Message);
        }
    }

    public async ValueTask DisposeAsync()
    {
        IBiDi? session = this.bidi;
        this.bidi = null;
        if (session is not null)
        {
            await session.DisposeAsync().ConfigureAwait(false);
        }

        this.connecting.Dispose();
    }

    // One BiDi connection per driver, opened on the first snapshot. New documents get the atom
    // installed as they load; documents that predate the preload install it on first use, in
    // CallAsync(). The flag follows a successful registration, so a failed one is tried again on
    // the next snapshot.
    private async Task<IBiDi> SessionAsync(CancellationToken cancellationToken)
    {
        await this.connecting.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            this.bidi ??= await this.driver.AsBiDiAsync(cancellationToken: cancellationToken).ConfigureAwait(false);
            if (!this.preloaded)
            {
                try
                {
                    await this.bidi.Script.AddPreloadScriptAsync(
                        "() => { globalThis." + Global + " = (" + ResourceUtilities.AccessibilitySnapshotAtom + "); }",
                        new AddPreloadScriptOptions { Sandbox = Sandbox },
                        cancellationToken).ConfigureAwait(false);
                    this.preloaded = true;
                }
                catch (BiDiException e)
                {
                    _logger.Debug("accessibility snapshot: preload not installed, falling back to on-demand install: " + e.Message);
                }
            }

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

        RemoteValue? result = await CallAsync(session, context, Declaration("globalThis." + Global, rootId), arguments, false, cancellationToken).ConfigureAwait(false);
        if (result is null)
        {
            // The realm has no atom yet (a document loaded before the preload, or a remote end
            // without preload support): install it and run in one call.
            string declaration = Declaration("(globalThis." + Global + " = (" + ResourceUtilities.AccessibilitySnapshotAtom + "))", rootId);
            result = await CallAsync(session, context, declaration, arguments, true, cancellationToken).ConfigureAwait(false);
        }

        if (result is null || result is NullRemoteValue)
        {
            // Another document owns the root (Firefox resolves shared ids group-wide).
            return null;
        }

        return await this.DecodeAsync(session, result, context, cancellationToken).ConfigureAwait(false);
    }

    // The function to call: the whole page, or a root this document owns, else null.
    private static string Declaration(string atom, string? rootId)
    {
        if (rootId is null)
        {
            return "() => " + atom + "()";
        }

        return "(root) => root && root.ownerDocument === document ? " + atom + "(root) : null";
    }

    // Runs the declaration in the sandbox of the context; null when it threw and a retry may help.
    private static async Task<RemoteValue?> CallAsync(IBiDi session, BiDiBrowsingContext context, string declaration, ImmutableArray<LocalValue> arguments, bool installAndRun, CancellationToken cancellationToken)
    {
        CallFunctionOptions options = new CallFunctionOptions
        {
            Arguments = arguments,
            ResultOwnership = ResultOwnership.None,
            SerializationOptions = new SerializationOptions { MaxDomDepth = 0 },
        };

        EvaluateResult result = await CallFunctionAsync(session, context, declaration, options, cancellationToken).ConfigureAwait(false);
        if (result is EvaluateResultSuccess success)
        {
            return success.Result;
        }

        string text = result is EvaluateResultException failure ? failure.ExceptionDetails.Text : result.ToString()!;
        if (text.Contains("detached"))
        {
            throw new StaleElementReferenceException(StaleMessage);
        }

        if (!installAndRun)
        {
            return null;
        }

        throw new WebDriverException("accessibility snapshot failed in the page: " + text);
    }

    private static async Task<EvaluateResult> CallFunctionAsync(IBiDi session, BiDiBrowsingContext context, string declaration, CallFunctionOptions options, CancellationToken cancellationToken)
    {
        try
        {
            return await session.Script.CallFunctionAsync(declaration, false, new ContextTarget(context) { Sandbox = Sandbox }, options, cancellationToken).ConfigureAwait(false);
        }
        catch (BiDiException e) when (Mentions(e, "no such node"))
        {
            // The document of this context does not own the root's shared id, either because the
            // root lives in another frame or because its document is gone.
            throw new NotOwnedException(e);
        }
    }

    // Decodes a snapshot from the callFunction result that carries it: an object remote value whose
    // entries are the node's fields, with arrays as array values and elements as node values
    // carrying a sharedId. An iframe node's children are replaced by its document's tree where
    // reachable.
    private async Task<AccessibilityNode> DecodeAsync(IBiDi session, RemoteValue value, BiDiBrowsingContext context, CancellationToken cancellationToken)
    {
        Dictionary<string, RemoteValue> fields = ObjectFields(value);
        string? sharedId = fields.TryGetValue("element", out RemoteValue? elementValue) && elementValue is NodeRemoteValue node ? node.SharedId : null;
        string role = StringOf(Required(fields, "role"));

        Dictionary<string, object> states = new Dictionary<string, object>();
        foreach (KeyValuePair<string, RemoteValue> state in ObjectFields(Required(fields, "states")))
        {
            states[state.Key] = StateOf(state.Value);
        }

        List<AccessibilityNode> children = new List<AccessibilityNode>();
        if (role == "iframe" && sharedId is not null)
        {
            children.AddRange(await this.StitchAsync(session, context, sharedId, cancellationToken).ConfigureAwait(false));
        }
        else
        {
            if (Required(fields, "children") is not ArrayRemoteValue array)
            {
                throw new WebDriverException("accessibility snapshot: expected an array of children");
            }

            foreach (RemoteValue child in array.Value ?? ImmutableArray<RemoteValue>.Empty)
            {
                children.Add(await this.DecodeAsync(session, child, context, cancellationToken).ConfigureAwait(false));
            }
        }

        return new AccessibilityNode(
            role,
            StringOf(Required(fields, "name")),
            fields.TryGetValue("description", out RemoteValue? description) ? StringOf(description) : string.Empty,
            fields.TryGetValue("value", out RemoteValue? fieldValue) ? StringOf(fieldValue) : null,
            states,
            sharedId is null ? null : this.driver.CreateElementFromReference(sharedId),
            children);
    }

    // The document of a frame as the frame node's one child, or no children when unreachable.
    private async Task<IReadOnlyList<AccessibilityNode>> StitchAsync(IBiDi session, BiDiBrowsingContext context, string frameId, CancellationToken cancellationToken)
    {
        BiDiBrowsingContext? childContext = await FrameContextAsync(session, context, frameId, cancellationToken).ConfigureAwait(false);
        if (childContext is null)
        {
            return Array.Empty<AccessibilityNode>();
        }

        try
        {
            AccessibilityNode? document = await this.SnapshotContextAsync(session, childContext, null, cancellationToken).ConfigureAwait(false);
            return document is null ? Array.Empty<AccessibilityNode>() : new[] { document };
        }
        catch (Exception e) when (FrameUnreachable(e))
        {
            // Gone between discovery and the call, or mid-navigation: the frame stays a leaf.
            // Anything else is a real failure.
            _logger.Debug("accessibility snapshot: frame " + childContext.Id + " not reachable: " + e.Message);
            return Array.Empty<AccessibilityNode>();
        }
    }

    // The browsing context of a frame element, from its WindowProxy; null when it has none.
    private static async Task<BiDiBrowsingContext?> FrameContextAsync(IBiDi session, BiDiBrowsingContext context, string frameId, CancellationToken cancellationToken)
    {
        CallFunctionOptions options = new CallFunctionOptions
        {
            Arguments = ImmutableArray.Create<LocalValue>(new SharedReferenceLocalValue(frameId)),
            ResultOwnership = ResultOwnership.None,
        };

        EvaluateResult result;
        try
        {
            result = await CallFunctionAsync(session, context, "(frame) => frame.contentWindow", options, cancellationToken).ConfigureAwait(false);
        }
        catch (Exception e) when (FrameUnreachable(e))
        {
            _logger.Debug("accessibility snapshot: no browsing context for frame: " + e.Message);
            return null;
        }

        return result is EvaluateResultSuccess success && success.Result is WindowProxyRemoteValue window ? window.Value.Context : null;
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

    private static RemoteValue Required(Dictionary<string, RemoteValue> fields, string name)
    {
        if (!fields.TryGetValue(name, out RemoteValue? value))
        {
            throw new WebDriverException("accessibility snapshot: the node has no " + name);
        }

        return value;
    }

    private static string StringOf(RemoteValue value)
    {
        return value switch
        {
            StringRemoteValue s => s.Value,
            NullRemoteValue or UndefinedRemoteValue => string.Empty,
            BooleanRemoteValue b => b.Value ? "true" : "false",
            NumberRemoteValue n => Convert.ToString(n.Value, System.Globalization.CultureInfo.InvariantCulture),
            _ => value.ToString() ?? string.Empty,
        };
    }

    private static object StateOf(RemoteValue value)
    {
        return value switch
        {
            BooleanRemoteValue b => b.Value,
            NumberRemoteValue n => Convert.ToInt64(n.Value),
            _ => StringOf(value),
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
