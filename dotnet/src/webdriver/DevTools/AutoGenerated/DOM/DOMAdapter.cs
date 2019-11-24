namespace OpenQA.Selenium.DevTools.DOM
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the DOM domain to simplify the command interface.
    /// </summary>
    public class DOMAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "DOM";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public DOMAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
            m_eventMap["attributeModified"] = new DevToolsEventData(typeof(AttributeModifiedEventArgs), OnAttributeModified);
            m_eventMap["attributeRemoved"] = new DevToolsEventData(typeof(AttributeRemovedEventArgs), OnAttributeRemoved);
            m_eventMap["characterDataModified"] = new DevToolsEventData(typeof(CharacterDataModifiedEventArgs), OnCharacterDataModified);
            m_eventMap["childNodeCountUpdated"] = new DevToolsEventData(typeof(ChildNodeCountUpdatedEventArgs), OnChildNodeCountUpdated);
            m_eventMap["childNodeInserted"] = new DevToolsEventData(typeof(ChildNodeInsertedEventArgs), OnChildNodeInserted);
            m_eventMap["childNodeRemoved"] = new DevToolsEventData(typeof(ChildNodeRemovedEventArgs), OnChildNodeRemoved);
            m_eventMap["distributedNodesUpdated"] = new DevToolsEventData(typeof(DistributedNodesUpdatedEventArgs), OnDistributedNodesUpdated);
            m_eventMap["documentUpdated"] = new DevToolsEventData(typeof(DocumentUpdatedEventArgs), OnDocumentUpdated);
            m_eventMap["inlineStyleInvalidated"] = new DevToolsEventData(typeof(InlineStyleInvalidatedEventArgs), OnInlineStyleInvalidated);
            m_eventMap["pseudoElementAdded"] = new DevToolsEventData(typeof(PseudoElementAddedEventArgs), OnPseudoElementAdded);
            m_eventMap["pseudoElementRemoved"] = new DevToolsEventData(typeof(PseudoElementRemovedEventArgs), OnPseudoElementRemoved);
            m_eventMap["setChildNodes"] = new DevToolsEventData(typeof(SetChildNodesEventArgs), OnSetChildNodes);
            m_eventMap["shadowRootPopped"] = new DevToolsEventData(typeof(ShadowRootPoppedEventArgs), OnShadowRootPopped);
            m_eventMap["shadowRootPushed"] = new DevToolsEventData(typeof(ShadowRootPushedEventArgs), OnShadowRootPushed);
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }

        /// <summary>
        /// Fired when `Element`'s attribute is modified.
        /// </summary>
        public event EventHandler<AttributeModifiedEventArgs> AttributeModified;
        /// <summary>
        /// Fired when `Element`'s attribute is removed.
        /// </summary>
        public event EventHandler<AttributeRemovedEventArgs> AttributeRemoved;
        /// <summary>
        /// Mirrors `DOMCharacterDataModified` event.
        /// </summary>
        public event EventHandler<CharacterDataModifiedEventArgs> CharacterDataModified;
        /// <summary>
        /// Fired when `Container`'s child node count has changed.
        /// </summary>
        public event EventHandler<ChildNodeCountUpdatedEventArgs> ChildNodeCountUpdated;
        /// <summary>
        /// Mirrors `DOMNodeInserted` event.
        /// </summary>
        public event EventHandler<ChildNodeInsertedEventArgs> ChildNodeInserted;
        /// <summary>
        /// Mirrors `DOMNodeRemoved` event.
        /// </summary>
        public event EventHandler<ChildNodeRemovedEventArgs> ChildNodeRemoved;
        /// <summary>
        /// Called when distrubution is changed.
        /// </summary>
        public event EventHandler<DistributedNodesUpdatedEventArgs> DistributedNodesUpdated;
        /// <summary>
        /// Fired when `Document` has been totally updated. Node ids are no longer valid.
        /// </summary>
        public event EventHandler<DocumentUpdatedEventArgs> DocumentUpdated;
        /// <summary>
        /// Fired when `Element`'s inline style is modified via a CSS property modification.
        /// </summary>
        public event EventHandler<InlineStyleInvalidatedEventArgs> InlineStyleInvalidated;
        /// <summary>
        /// Called when a pseudo element is added to an element.
        /// </summary>
        public event EventHandler<PseudoElementAddedEventArgs> PseudoElementAdded;
        /// <summary>
        /// Called when a pseudo element is removed from an element.
        /// </summary>
        public event EventHandler<PseudoElementRemovedEventArgs> PseudoElementRemoved;
        /// <summary>
        /// Fired when backend wants to provide client with the missing DOM structure. This happens upon
        /// most of the calls requesting node ids.
        /// </summary>
        public event EventHandler<SetChildNodesEventArgs> SetChildNodes;
        /// <summary>
        /// Called when shadow root is popped from the element.
        /// </summary>
        public event EventHandler<ShadowRootPoppedEventArgs> ShadowRootPopped;
        /// <summary>
        /// Called when shadow root is pushed into the element.
        /// </summary>
        public event EventHandler<ShadowRootPushedEventArgs> ShadowRootPushed;

        /// <summary>
        /// Collects class names for the node with given id and all of it's child nodes.
        /// </summary>
        public async Task<CollectClassNamesFromSubtreeCommandResponse> CollectClassNamesFromSubtree(CollectClassNamesFromSubtreeCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CollectClassNamesFromSubtreeCommandSettings, CollectClassNamesFromSubtreeCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Creates a deep copy of the specified node and places it into the target container before the
        /// given anchor.
        /// </summary>
        public async Task<CopyToCommandResponse> CopyTo(CopyToCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CopyToCommandSettings, CopyToCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Describes node given its id, does not require domain to be enabled. Does not start tracking any
        /// objects, can be used for automation.
        /// </summary>
        public async Task<DescribeNodeCommandResponse> DescribeNode(DescribeNodeCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DescribeNodeCommandSettings, DescribeNodeCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Disables DOM agent for the given page.
        /// </summary>
        public async Task<DisableCommandResponse> Disable(DisableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DisableCommandSettings, DisableCommandResponse>(command ?? new DisableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Discards search results from the session with the given id. `getSearchResults` should no longer
        /// be called for that search.
        /// </summary>
        public async Task<DiscardSearchResultsCommandResponse> DiscardSearchResults(DiscardSearchResultsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DiscardSearchResultsCommandSettings, DiscardSearchResultsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables DOM agent for the given page.
        /// </summary>
        public async Task<EnableCommandResponse> Enable(EnableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EnableCommandSettings, EnableCommandResponse>(command ?? new EnableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Focuses the given element.
        /// </summary>
        public async Task<FocusCommandResponse> Focus(FocusCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<FocusCommandSettings, FocusCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns attributes for the specified node.
        /// </summary>
        public async Task<GetAttributesCommandResponse> GetAttributes(GetAttributesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetAttributesCommandSettings, GetAttributesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns boxes for the given node.
        /// </summary>
        public async Task<GetBoxModelCommandResponse> GetBoxModel(GetBoxModelCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetBoxModelCommandSettings, GetBoxModelCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns quads that describe node position on the page. This method
        /// might return multiple quads for inline nodes.
        /// </summary>
        public async Task<GetContentQuadsCommandResponse> GetContentQuads(GetContentQuadsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetContentQuadsCommandSettings, GetContentQuadsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns the root DOM node (and optionally the subtree) to the caller.
        /// </summary>
        public async Task<GetDocumentCommandResponse> GetDocument(GetDocumentCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetDocumentCommandSettings, GetDocumentCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns the root DOM node (and optionally the subtree) to the caller.
        /// </summary>
        public async Task<GetFlattenedDocumentCommandResponse> GetFlattenedDocument(GetFlattenedDocumentCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetFlattenedDocumentCommandSettings, GetFlattenedDocumentCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns node id at given location. Depending on whether DOM domain is enabled, nodeId is
        /// either returned or not.
        /// </summary>
        public async Task<GetNodeForLocationCommandResponse> GetNodeForLocation(GetNodeForLocationCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetNodeForLocationCommandSettings, GetNodeForLocationCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns node's HTML markup.
        /// </summary>
        public async Task<GetOuterHTMLCommandResponse> GetOuterHTML(GetOuterHTMLCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetOuterHTMLCommandSettings, GetOuterHTMLCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns the id of the nearest ancestor that is a relayout boundary.
        /// </summary>
        public async Task<GetRelayoutBoundaryCommandResponse> GetRelayoutBoundary(GetRelayoutBoundaryCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetRelayoutBoundaryCommandSettings, GetRelayoutBoundaryCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns search results from given `fromIndex` to given `toIndex` from the search with the given
        /// identifier.
        /// </summary>
        public async Task<GetSearchResultsCommandResponse> GetSearchResults(GetSearchResultsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetSearchResultsCommandSettings, GetSearchResultsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Hides any highlight.
        /// </summary>
        public async Task<HideHighlightCommandResponse> HideHighlight(HideHighlightCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<HideHighlightCommandSettings, HideHighlightCommandResponse>(command ?? new HideHighlightCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Highlights DOM node.
        /// </summary>
        public async Task<HighlightNodeCommandResponse> HighlightNode(HighlightNodeCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<HighlightNodeCommandSettings, HighlightNodeCommandResponse>(command ?? new HighlightNodeCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Highlights given rectangle.
        /// </summary>
        public async Task<HighlightRectCommandResponse> HighlightRect(HighlightRectCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<HighlightRectCommandSettings, HighlightRectCommandResponse>(command ?? new HighlightRectCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Marks last undoable state.
        /// </summary>
        public async Task<MarkUndoableStateCommandResponse> MarkUndoableState(MarkUndoableStateCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<MarkUndoableStateCommandSettings, MarkUndoableStateCommandResponse>(command ?? new MarkUndoableStateCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Moves node into the new container, places it before the given anchor.
        /// </summary>
        public async Task<MoveToCommandResponse> MoveTo(MoveToCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<MoveToCommandSettings, MoveToCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Searches for a given string in the DOM tree. Use `getSearchResults` to access search results or
        /// `cancelSearch` to end this search session.
        /// </summary>
        public async Task<PerformSearchCommandResponse> PerformSearch(PerformSearchCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<PerformSearchCommandSettings, PerformSearchCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Requests that the node is sent to the caller given its path. // FIXME, use XPath
        /// </summary>
        public async Task<PushNodeByPathToFrontendCommandResponse> PushNodeByPathToFrontend(PushNodeByPathToFrontendCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<PushNodeByPathToFrontendCommandSettings, PushNodeByPathToFrontendCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Requests that a batch of nodes is sent to the caller given their backend node ids.
        /// </summary>
        public async Task<PushNodesByBackendIdsToFrontendCommandResponse> PushNodesByBackendIdsToFrontend(PushNodesByBackendIdsToFrontendCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<PushNodesByBackendIdsToFrontendCommandSettings, PushNodesByBackendIdsToFrontendCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Executes `querySelector` on a given node.
        /// </summary>
        public async Task<QuerySelectorCommandResponse> QuerySelector(QuerySelectorCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<QuerySelectorCommandSettings, QuerySelectorCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Executes `querySelectorAll` on a given node.
        /// </summary>
        public async Task<QuerySelectorAllCommandResponse> QuerySelectorAll(QuerySelectorAllCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<QuerySelectorAllCommandSettings, QuerySelectorAllCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Re-does the last undone action.
        /// </summary>
        public async Task<RedoCommandResponse> Redo(RedoCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RedoCommandSettings, RedoCommandResponse>(command ?? new RedoCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Removes attribute with given name from an element with given id.
        /// </summary>
        public async Task<RemoveAttributeCommandResponse> RemoveAttribute(RemoveAttributeCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RemoveAttributeCommandSettings, RemoveAttributeCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Removes node with given id.
        /// </summary>
        public async Task<RemoveNodeCommandResponse> RemoveNode(RemoveNodeCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RemoveNodeCommandSettings, RemoveNodeCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Requests that children of the node with given id are returned to the caller in form of
        /// `setChildNodes` events where not only immediate children are retrieved, but all children down to
        /// the specified depth.
        /// </summary>
        public async Task<RequestChildNodesCommandResponse> RequestChildNodes(RequestChildNodesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RequestChildNodesCommandSettings, RequestChildNodesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Requests that the node is sent to the caller given the JavaScript node object reference. All
        /// nodes that form the path from the node to the root are also sent to the client as a series of
        /// `setChildNodes` notifications.
        /// </summary>
        public async Task<RequestNodeCommandResponse> RequestNode(RequestNodeCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RequestNodeCommandSettings, RequestNodeCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Resolves the JavaScript node object for a given NodeId or BackendNodeId.
        /// </summary>
        public async Task<ResolveNodeCommandResponse> ResolveNode(ResolveNodeCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ResolveNodeCommandSettings, ResolveNodeCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets attribute for an element with given id.
        /// </summary>
        public async Task<SetAttributeValueCommandResponse> SetAttributeValue(SetAttributeValueCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetAttributeValueCommandSettings, SetAttributeValueCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets attributes on element with given id. This method is useful when user edits some existing
        /// attribute value and types in several attribute name/value pairs.
        /// </summary>
        public async Task<SetAttributesAsTextCommandResponse> SetAttributesAsText(SetAttributesAsTextCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetAttributesAsTextCommandSettings, SetAttributesAsTextCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets files for the given file input element.
        /// </summary>
        public async Task<SetFileInputFilesCommandResponse> SetFileInputFiles(SetFileInputFilesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetFileInputFilesCommandSettings, SetFileInputFilesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns file information for the given
        /// File wrapper.
        /// </summary>
        public async Task<GetFileInfoCommandResponse> GetFileInfo(GetFileInfoCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetFileInfoCommandSettings, GetFileInfoCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables console to refer to the node with given id via $x (see Command Line API for more details
        /// $x functions).
        /// </summary>
        public async Task<SetInspectedNodeCommandResponse> SetInspectedNode(SetInspectedNodeCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetInspectedNodeCommandSettings, SetInspectedNodeCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets node name for a node with given id.
        /// </summary>
        public async Task<SetNodeNameCommandResponse> SetNodeName(SetNodeNameCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetNodeNameCommandSettings, SetNodeNameCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets node value for a node with given id.
        /// </summary>
        public async Task<SetNodeValueCommandResponse> SetNodeValue(SetNodeValueCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetNodeValueCommandSettings, SetNodeValueCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets node HTML markup, returns new node id.
        /// </summary>
        public async Task<SetOuterHTMLCommandResponse> SetOuterHTML(SetOuterHTMLCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetOuterHTMLCommandSettings, SetOuterHTMLCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Undoes the last performed action.
        /// </summary>
        public async Task<UndoCommandResponse> Undo(UndoCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<UndoCommandSettings, UndoCommandResponse>(command ?? new UndoCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns iframe node that owns iframe with the given domain.
        /// </summary>
        public async Task<GetFrameOwnerCommandResponse> GetFrameOwner(GetFrameOwnerCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetFrameOwnerCommandSettings, GetFrameOwnerCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }

        private void OnDevToolsEventReceived(object sender, DevToolsEventReceivedEventArgs e)
        {
            if (e.DomainName == m_domainName)
            {
                if (m_eventMap.ContainsKey(e.EventName))
                {
                    var eventData = m_eventMap[e.EventName];
                    var eventArgs = e.EventData.ToObject(eventData.EventArgsType);
                    eventData.EventInvoker(eventArgs);
                }
            }
        }

        private void OnAttributeModified(object rawEventArgs)
        {
            AttributeModifiedEventArgs e = rawEventArgs as AttributeModifiedEventArgs;
            if (e != null && AttributeModified != null)
            {
                AttributeModified(this, e);
            }
        }
        private void OnAttributeRemoved(object rawEventArgs)
        {
            AttributeRemovedEventArgs e = rawEventArgs as AttributeRemovedEventArgs;
            if (e != null && AttributeRemoved != null)
            {
                AttributeRemoved(this, e);
            }
        }
        private void OnCharacterDataModified(object rawEventArgs)
        {
            CharacterDataModifiedEventArgs e = rawEventArgs as CharacterDataModifiedEventArgs;
            if (e != null && CharacterDataModified != null)
            {
                CharacterDataModified(this, e);
            }
        }
        private void OnChildNodeCountUpdated(object rawEventArgs)
        {
            ChildNodeCountUpdatedEventArgs e = rawEventArgs as ChildNodeCountUpdatedEventArgs;
            if (e != null && ChildNodeCountUpdated != null)
            {
                ChildNodeCountUpdated(this, e);
            }
        }
        private void OnChildNodeInserted(object rawEventArgs)
        {
            ChildNodeInsertedEventArgs e = rawEventArgs as ChildNodeInsertedEventArgs;
            if (e != null && ChildNodeInserted != null)
            {
                ChildNodeInserted(this, e);
            }
        }
        private void OnChildNodeRemoved(object rawEventArgs)
        {
            ChildNodeRemovedEventArgs e = rawEventArgs as ChildNodeRemovedEventArgs;
            if (e != null && ChildNodeRemoved != null)
            {
                ChildNodeRemoved(this, e);
            }
        }
        private void OnDistributedNodesUpdated(object rawEventArgs)
        {
            DistributedNodesUpdatedEventArgs e = rawEventArgs as DistributedNodesUpdatedEventArgs;
            if (e != null && DistributedNodesUpdated != null)
            {
                DistributedNodesUpdated(this, e);
            }
        }
        private void OnDocumentUpdated(object rawEventArgs)
        {
            DocumentUpdatedEventArgs e = rawEventArgs as DocumentUpdatedEventArgs;
            if (e != null && DocumentUpdated != null)
            {
                DocumentUpdated(this, e);
            }
        }
        private void OnInlineStyleInvalidated(object rawEventArgs)
        {
            InlineStyleInvalidatedEventArgs e = rawEventArgs as InlineStyleInvalidatedEventArgs;
            if (e != null && InlineStyleInvalidated != null)
            {
                InlineStyleInvalidated(this, e);
            }
        }
        private void OnPseudoElementAdded(object rawEventArgs)
        {
            PseudoElementAddedEventArgs e = rawEventArgs as PseudoElementAddedEventArgs;
            if (e != null && PseudoElementAdded != null)
            {
                PseudoElementAdded(this, e);
            }
        }
        private void OnPseudoElementRemoved(object rawEventArgs)
        {
            PseudoElementRemovedEventArgs e = rawEventArgs as PseudoElementRemovedEventArgs;
            if (e != null && PseudoElementRemoved != null)
            {
                PseudoElementRemoved(this, e);
            }
        }
        private void OnSetChildNodes(object rawEventArgs)
        {
            SetChildNodesEventArgs e = rawEventArgs as SetChildNodesEventArgs;
            if (e != null && SetChildNodes != null)
            {
                SetChildNodes(this, e);
            }
        }
        private void OnShadowRootPopped(object rawEventArgs)
        {
            ShadowRootPoppedEventArgs e = rawEventArgs as ShadowRootPoppedEventArgs;
            if (e != null && ShadowRootPopped != null)
            {
                ShadowRootPopped(this, e);
            }
        }
        private void OnShadowRootPushed(object rawEventArgs)
        {
            ShadowRootPushedEventArgs e = rawEventArgs as ShadowRootPushedEventArgs;
            if (e != null && ShadowRootPushed != null)
            {
                ShadowRootPushed(this, e);
            }
        }
    }
}