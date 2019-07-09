namespace OpenQA.Selenium.DevTools.Runtime
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Runtime domain to simplify the command interface.
    /// </summary>
    public class RuntimeAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Runtime";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public RuntimeAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
            m_eventMap["bindingCalled"] = new DevToolsEventData(typeof(BindingCalledEventArgs), OnBindingCalled);
            m_eventMap["consoleAPICalled"] = new DevToolsEventData(typeof(ConsoleAPICalledEventArgs), OnConsoleAPICalled);
            m_eventMap["exceptionRevoked"] = new DevToolsEventData(typeof(ExceptionRevokedEventArgs), OnExceptionRevoked);
            m_eventMap["exceptionThrown"] = new DevToolsEventData(typeof(ExceptionThrownEventArgs), OnExceptionThrown);
            m_eventMap["executionContextCreated"] = new DevToolsEventData(typeof(ExecutionContextCreatedEventArgs), OnExecutionContextCreated);
            m_eventMap["executionContextDestroyed"] = new DevToolsEventData(typeof(ExecutionContextDestroyedEventArgs), OnExecutionContextDestroyed);
            m_eventMap["executionContextsCleared"] = new DevToolsEventData(typeof(ExecutionContextsClearedEventArgs), OnExecutionContextsCleared);
            m_eventMap["inspectRequested"] = new DevToolsEventData(typeof(InspectRequestedEventArgs), OnInspectRequested);
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }

        /// <summary>
        /// Notification is issued every time when binding is called.
        /// </summary>
        public event EventHandler<BindingCalledEventArgs> BindingCalled;
        /// <summary>
        /// Issued when console API was called.
        /// </summary>
        public event EventHandler<ConsoleAPICalledEventArgs> ConsoleAPICalled;
        /// <summary>
        /// Issued when unhandled exception was revoked.
        /// </summary>
        public event EventHandler<ExceptionRevokedEventArgs> ExceptionRevoked;
        /// <summary>
        /// Issued when exception was thrown and unhandled.
        /// </summary>
        public event EventHandler<ExceptionThrownEventArgs> ExceptionThrown;
        /// <summary>
        /// Issued when new execution context is created.
        /// </summary>
        public event EventHandler<ExecutionContextCreatedEventArgs> ExecutionContextCreated;
        /// <summary>
        /// Issued when execution context is destroyed.
        /// </summary>
        public event EventHandler<ExecutionContextDestroyedEventArgs> ExecutionContextDestroyed;
        /// <summary>
        /// Issued when all executionContexts were cleared in browser
        /// </summary>
        public event EventHandler<ExecutionContextsClearedEventArgs> ExecutionContextsCleared;
        /// <summary>
        /// Issued when object should be inspected (for example, as a result of inspect() command line API
        /// call).
        /// </summary>
        public event EventHandler<InspectRequestedEventArgs> InspectRequested;

        /// <summary>
        /// Add handler to promise with given promise object id.
        /// </summary>
        public async Task<AwaitPromiseCommandResponse> AwaitPromise(AwaitPromiseCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<AwaitPromiseCommandSettings, AwaitPromiseCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Calls function with given declaration on the given object. Object group of the result is
        /// inherited from the target object.
        /// </summary>
        public async Task<CallFunctionOnCommandResponse> CallFunctionOn(CallFunctionOnCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CallFunctionOnCommandSettings, CallFunctionOnCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Compiles expression.
        /// </summary>
        public async Task<CompileScriptCommandResponse> CompileScript(CompileScriptCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CompileScriptCommandSettings, CompileScriptCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Disables reporting of execution contexts creation.
        /// </summary>
        public async Task<DisableCommandResponse> Disable(DisableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DisableCommandSettings, DisableCommandResponse>(command ?? new DisableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Discards collected exceptions and console API calls.
        /// </summary>
        public async Task<DiscardConsoleEntriesCommandResponse> DiscardConsoleEntries(DiscardConsoleEntriesCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DiscardConsoleEntriesCommandSettings, DiscardConsoleEntriesCommandResponse>(command ?? new DiscardConsoleEntriesCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables reporting of execution contexts creation by means of `executionContextCreated` event.
        /// When the reporting gets enabled the event will be sent immediately for each existing execution
        /// context.
        /// </summary>
        public async Task<EnableCommandResponse> Enable(EnableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EnableCommandSettings, EnableCommandResponse>(command ?? new EnableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Evaluates expression on global object.
        /// </summary>
        public async Task<EvaluateCommandResponse> Evaluate(EvaluateCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EvaluateCommandSettings, EvaluateCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns the isolate id.
        /// </summary>
        public async Task<GetIsolateIdCommandResponse> GetIsolateId(GetIsolateIdCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetIsolateIdCommandSettings, GetIsolateIdCommandResponse>(command ?? new GetIsolateIdCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns the JavaScript heap usage.
        /// It is the total usage of the corresponding isolate not scoped to a particular Runtime.
        /// </summary>
        public async Task<GetHeapUsageCommandResponse> GetHeapUsage(GetHeapUsageCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetHeapUsageCommandSettings, GetHeapUsageCommandResponse>(command ?? new GetHeapUsageCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns properties of a given object. Object group of the result is inherited from the target
        /// object.
        /// </summary>
        public async Task<GetPropertiesCommandResponse> GetProperties(GetPropertiesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetPropertiesCommandSettings, GetPropertiesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns all let, const and class variables from global scope.
        /// </summary>
        public async Task<GlobalLexicalScopeNamesCommandResponse> GlobalLexicalScopeNames(GlobalLexicalScopeNamesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GlobalLexicalScopeNamesCommandSettings, GlobalLexicalScopeNamesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// queryObjects
        /// </summary>
        public async Task<QueryObjectsCommandResponse> QueryObjects(QueryObjectsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<QueryObjectsCommandSettings, QueryObjectsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Releases remote object with given id.
        /// </summary>
        public async Task<ReleaseObjectCommandResponse> ReleaseObject(ReleaseObjectCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ReleaseObjectCommandSettings, ReleaseObjectCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Releases all remote objects that belong to a given group.
        /// </summary>
        public async Task<ReleaseObjectGroupCommandResponse> ReleaseObjectGroup(ReleaseObjectGroupCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ReleaseObjectGroupCommandSettings, ReleaseObjectGroupCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Tells inspected instance to run if it was waiting for debugger to attach.
        /// </summary>
        public async Task<RunIfWaitingForDebuggerCommandResponse> RunIfWaitingForDebugger(RunIfWaitingForDebuggerCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RunIfWaitingForDebuggerCommandSettings, RunIfWaitingForDebuggerCommandResponse>(command ?? new RunIfWaitingForDebuggerCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Runs script with given id in a given context.
        /// </summary>
        public async Task<RunScriptCommandResponse> RunScript(RunScriptCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RunScriptCommandSettings, RunScriptCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables or disables async call stacks tracking.
        /// </summary>
        public async Task<SetAsyncCallStackDepthCommandResponse> SetAsyncCallStackDepth(SetAsyncCallStackDepthCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetAsyncCallStackDepthCommandSettings, SetAsyncCallStackDepthCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// setCustomObjectFormatterEnabled
        /// </summary>
        public async Task<SetCustomObjectFormatterEnabledCommandResponse> SetCustomObjectFormatterEnabled(SetCustomObjectFormatterEnabledCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetCustomObjectFormatterEnabledCommandSettings, SetCustomObjectFormatterEnabledCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// setMaxCallStackSizeToCapture
        /// </summary>
        public async Task<SetMaxCallStackSizeToCaptureCommandResponse> SetMaxCallStackSizeToCapture(SetMaxCallStackSizeToCaptureCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetMaxCallStackSizeToCaptureCommandSettings, SetMaxCallStackSizeToCaptureCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Terminate current or next JavaScript execution.
        /// Will cancel the termination when the outer-most script execution ends.
        /// </summary>
        public async Task<TerminateExecutionCommandResponse> TerminateExecution(TerminateExecutionCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<TerminateExecutionCommandSettings, TerminateExecutionCommandResponse>(command ?? new TerminateExecutionCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// If executionContextId is empty, adds binding with the given name on the
        /// global objects of all inspected contexts, including those created later,
        /// bindings survive reloads.
        /// If executionContextId is specified, adds binding only on global object of
        /// given execution context.
        /// Binding function takes exactly one argument, this argument should be string,
        /// in case of any other input, function throws an exception.
        /// Each binding function call produces Runtime.bindingCalled notification.
        /// </summary>
        public async Task<AddBindingCommandResponse> AddBinding(AddBindingCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<AddBindingCommandSettings, AddBindingCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// This method does not remove binding function from global object but
        /// unsubscribes current runtime agent from Runtime.bindingCalled notifications.
        /// </summary>
        public async Task<RemoveBindingCommandResponse> RemoveBinding(RemoveBindingCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RemoveBindingCommandSettings, RemoveBindingCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
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

        private void OnBindingCalled(object rawEventArgs)
        {
            BindingCalledEventArgs e = rawEventArgs as BindingCalledEventArgs;
            if (e != null && BindingCalled != null)
            {
                BindingCalled(this, e);
            }
        }
        private void OnConsoleAPICalled(object rawEventArgs)
        {
            ConsoleAPICalledEventArgs e = rawEventArgs as ConsoleAPICalledEventArgs;
            if (e != null && ConsoleAPICalled != null)
            {
                ConsoleAPICalled(this, e);
            }
        }
        private void OnExceptionRevoked(object rawEventArgs)
        {
            ExceptionRevokedEventArgs e = rawEventArgs as ExceptionRevokedEventArgs;
            if (e != null && ExceptionRevoked != null)
            {
                ExceptionRevoked(this, e);
            }
        }
        private void OnExceptionThrown(object rawEventArgs)
        {
            ExceptionThrownEventArgs e = rawEventArgs as ExceptionThrownEventArgs;
            if (e != null && ExceptionThrown != null)
            {
                ExceptionThrown(this, e);
            }
        }
        private void OnExecutionContextCreated(object rawEventArgs)
        {
            ExecutionContextCreatedEventArgs e = rawEventArgs as ExecutionContextCreatedEventArgs;
            if (e != null && ExecutionContextCreated != null)
            {
                ExecutionContextCreated(this, e);
            }
        }
        private void OnExecutionContextDestroyed(object rawEventArgs)
        {
            ExecutionContextDestroyedEventArgs e = rawEventArgs as ExecutionContextDestroyedEventArgs;
            if (e != null && ExecutionContextDestroyed != null)
            {
                ExecutionContextDestroyed(this, e);
            }
        }
        private void OnExecutionContextsCleared(object rawEventArgs)
        {
            ExecutionContextsClearedEventArgs e = rawEventArgs as ExecutionContextsClearedEventArgs;
            if (e != null && ExecutionContextsCleared != null)
            {
                ExecutionContextsCleared(this, e);
            }
        }
        private void OnInspectRequested(object rawEventArgs)
        {
            InspectRequestedEventArgs e = rawEventArgs as InspectRequestedEventArgs;
            if (e != null && InspectRequested != null)
            {
                InspectRequested(this, e);
            }
        }
    }
}