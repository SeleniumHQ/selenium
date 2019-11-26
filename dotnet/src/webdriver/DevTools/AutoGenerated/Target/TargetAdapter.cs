namespace OpenQA.Selenium.DevTools.Target
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Target domain to simplify the command interface.
    /// </summary>
    public class TargetAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Target";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public TargetAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
            m_eventMap["attachedToTarget"] = new DevToolsEventData(typeof(AttachedToTargetEventArgs), OnAttachedToTarget);
            m_eventMap["detachedFromTarget"] = new DevToolsEventData(typeof(DetachedFromTargetEventArgs), OnDetachedFromTarget);
            m_eventMap["receivedMessageFromTarget"] = new DevToolsEventData(typeof(ReceivedMessageFromTargetEventArgs), OnReceivedMessageFromTarget);
            m_eventMap["targetCreated"] = new DevToolsEventData(typeof(TargetCreatedEventArgs), OnTargetCreated);
            m_eventMap["targetDestroyed"] = new DevToolsEventData(typeof(TargetDestroyedEventArgs), OnTargetDestroyed);
            m_eventMap["targetCrashed"] = new DevToolsEventData(typeof(TargetCrashedEventArgs), OnTargetCrashed);
            m_eventMap["targetInfoChanged"] = new DevToolsEventData(typeof(TargetInfoChangedEventArgs), OnTargetInfoChanged);
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }

        /// <summary>
        /// Issued when attached to target because of auto-attach or `attachToTarget` command.
        /// </summary>
        public event EventHandler<AttachedToTargetEventArgs> AttachedToTarget;
        /// <summary>
        /// Issued when detached from target for any reason (including `detachFromTarget` command). Can be
        /// issued multiple times per target if multiple sessions have been attached to it.
        /// </summary>
        public event EventHandler<DetachedFromTargetEventArgs> DetachedFromTarget;
        /// <summary>
        /// Notifies about a new protocol message received from the session (as reported in
        /// `attachedToTarget` event).
        /// </summary>
        public event EventHandler<ReceivedMessageFromTargetEventArgs> ReceivedMessageFromTarget;
        /// <summary>
        /// Issued when a possible inspection target is created.
        /// </summary>
        public event EventHandler<TargetCreatedEventArgs> TargetCreated;
        /// <summary>
        /// Issued when a target is destroyed.
        /// </summary>
        public event EventHandler<TargetDestroyedEventArgs> TargetDestroyed;
        /// <summary>
        /// Issued when a target has crashed.
        /// </summary>
        public event EventHandler<TargetCrashedEventArgs> TargetCrashed;
        /// <summary>
        /// Issued when some information about a target has changed. This only happens between
        /// `targetCreated` and `targetDestroyed`.
        /// </summary>
        public event EventHandler<TargetInfoChangedEventArgs> TargetInfoChanged;

        /// <summary>
        /// Activates (focuses) the target.
        /// </summary>
        public async Task<ActivateTargetCommandResponse> ActivateTarget(ActivateTargetCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ActivateTargetCommandSettings, ActivateTargetCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Attaches to the target with given id.
        /// </summary>
        public async Task<AttachToTargetCommandResponse> AttachToTarget(AttachToTargetCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<AttachToTargetCommandSettings, AttachToTargetCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Attaches to the browser target, only uses flat sessionId mode.
        /// </summary>
        public async Task<AttachToBrowserTargetCommandResponse> AttachToBrowserTarget(AttachToBrowserTargetCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<AttachToBrowserTargetCommandSettings, AttachToBrowserTargetCommandResponse>(command ?? new AttachToBrowserTargetCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Closes the target. If the target is a page that gets closed too.
        /// </summary>
        public async Task<CloseTargetCommandResponse> CloseTarget(CloseTargetCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CloseTargetCommandSettings, CloseTargetCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Inject object to the target's main frame that provides a communication
        /// channel with browser target.
        /// 
        /// Injected object will be available as `window[bindingName]`.
        /// 
        /// The object has the follwing API:
        /// - `binding.send(json)` - a method to send messages over the remote debugging protocol
        /// - `binding.onmessage = json => handleMessage(json)` - a callback that will be called for the protocol notifications and command responses.
        /// </summary>
        public async Task<ExposeDevToolsProtocolCommandResponse> ExposeDevToolsProtocol(ExposeDevToolsProtocolCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ExposeDevToolsProtocolCommandSettings, ExposeDevToolsProtocolCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Creates a new empty BrowserContext. Similar to an incognito profile but you can have more than
        /// one.
        /// </summary>
        public async Task<CreateBrowserContextCommandResponse> CreateBrowserContext(CreateBrowserContextCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CreateBrowserContextCommandSettings, CreateBrowserContextCommandResponse>(command ?? new CreateBrowserContextCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns all browser contexts created with `Target.createBrowserContext` method.
        /// </summary>
        public async Task<GetBrowserContextsCommandResponse> GetBrowserContexts(GetBrowserContextsCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetBrowserContextsCommandSettings, GetBrowserContextsCommandResponse>(command ?? new GetBrowserContextsCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Creates a new page.
        /// </summary>
        public async Task<CreateTargetCommandResponse> CreateTarget(CreateTargetCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CreateTargetCommandSettings, CreateTargetCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Detaches session with given id.
        /// </summary>
        public async Task<DetachFromTargetCommandResponse> DetachFromTarget(DetachFromTargetCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DetachFromTargetCommandSettings, DetachFromTargetCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Deletes a BrowserContext. All the belonging pages will be closed without calling their
        /// beforeunload hooks.
        /// </summary>
        public async Task<DisposeBrowserContextCommandResponse> DisposeBrowserContext(DisposeBrowserContextCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DisposeBrowserContextCommandSettings, DisposeBrowserContextCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns information about a target.
        /// </summary>
        public async Task<GetTargetInfoCommandResponse> GetTargetInfo(GetTargetInfoCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetTargetInfoCommandSettings, GetTargetInfoCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Retrieves a list of available targets.
        /// </summary>
        public async Task<GetTargetsCommandResponse> GetTargets(GetTargetsCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetTargetsCommandSettings, GetTargetsCommandResponse>(command ?? new GetTargetsCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sends protocol message over session with given id.
        /// </summary>
        public async Task<SendMessageToTargetCommandResponse> SendMessageToTarget(SendMessageToTargetCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SendMessageToTargetCommandSettings, SendMessageToTargetCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Controls whether to automatically attach to new targets which are considered to be related to
        /// this one. When turned on, attaches to all existing related targets as well. When turned off,
        /// automatically detaches from all currently attached targets.
        /// </summary>
        public async Task<SetAutoAttachCommandResponse> SetAutoAttach(SetAutoAttachCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetAutoAttachCommandSettings, SetAutoAttachCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Controls whether to discover available targets and notify via
        /// `targetCreated/targetInfoChanged/targetDestroyed` events.
        /// </summary>
        public async Task<SetDiscoverTargetsCommandResponse> SetDiscoverTargets(SetDiscoverTargetsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDiscoverTargetsCommandSettings, SetDiscoverTargetsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables target discovery for the specified locations, when `setDiscoverTargets` was set to
        /// `true`.
        /// </summary>
        public async Task<SetRemoteLocationsCommandResponse> SetRemoteLocations(SetRemoteLocationsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetRemoteLocationsCommandSettings, SetRemoteLocationsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
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

        private void OnAttachedToTarget(object rawEventArgs)
        {
            AttachedToTargetEventArgs e = rawEventArgs as AttachedToTargetEventArgs;
            if (e != null && AttachedToTarget != null)
            {
                AttachedToTarget(this, e);
            }
        }
        private void OnDetachedFromTarget(object rawEventArgs)
        {
            DetachedFromTargetEventArgs e = rawEventArgs as DetachedFromTargetEventArgs;
            if (e != null && DetachedFromTarget != null)
            {
                DetachedFromTarget(this, e);
            }
        }
        private void OnReceivedMessageFromTarget(object rawEventArgs)
        {
            ReceivedMessageFromTargetEventArgs e = rawEventArgs as ReceivedMessageFromTargetEventArgs;
            if (e != null && ReceivedMessageFromTarget != null)
            {
                ReceivedMessageFromTarget(this, e);
            }
        }
        private void OnTargetCreated(object rawEventArgs)
        {
            TargetCreatedEventArgs e = rawEventArgs as TargetCreatedEventArgs;
            if (e != null && TargetCreated != null)
            {
                TargetCreated(this, e);
            }
        }
        private void OnTargetDestroyed(object rawEventArgs)
        {
            TargetDestroyedEventArgs e = rawEventArgs as TargetDestroyedEventArgs;
            if (e != null && TargetDestroyed != null)
            {
                TargetDestroyed(this, e);
            }
        }
        private void OnTargetCrashed(object rawEventArgs)
        {
            TargetCrashedEventArgs e = rawEventArgs as TargetCrashedEventArgs;
            if (e != null && TargetCrashed != null)
            {
                TargetCrashed(this, e);
            }
        }
        private void OnTargetInfoChanged(object rawEventArgs)
        {
            TargetInfoChangedEventArgs e = rawEventArgs as TargetInfoChangedEventArgs;
            if (e != null && TargetInfoChanged != null)
            {
                TargetInfoChanged(this, e);
            }
        }
    }
}