namespace OpenQA.Selenium.DevTools.Debugger
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Debugger domain to simplify the command interface.
    /// </summary>
    public class DebuggerAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Debugger";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public DebuggerAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
            m_eventMap["breakpointResolved"] = new DevToolsEventData(typeof(BreakpointResolvedEventArgs), OnBreakpointResolved);
            m_eventMap["paused"] = new DevToolsEventData(typeof(PausedEventArgs), OnPaused);
            m_eventMap["resumed"] = new DevToolsEventData(typeof(ResumedEventArgs), OnResumed);
            m_eventMap["scriptFailedToParse"] = new DevToolsEventData(typeof(ScriptFailedToParseEventArgs), OnScriptFailedToParse);
            m_eventMap["scriptParsed"] = new DevToolsEventData(typeof(ScriptParsedEventArgs), OnScriptParsed);
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }

        /// <summary>
        /// Fired when breakpoint is resolved to an actual script and location.
        /// </summary>
        public event EventHandler<BreakpointResolvedEventArgs> BreakpointResolved;
        /// <summary>
        /// Fired when the virtual machine stopped on breakpoint or exception or any other stop criteria.
        /// </summary>
        public event EventHandler<PausedEventArgs> Paused;
        /// <summary>
        /// Fired when the virtual machine resumed execution.
        /// </summary>
        public event EventHandler<ResumedEventArgs> Resumed;
        /// <summary>
        /// Fired when virtual machine fails to parse the script.
        /// </summary>
        public event EventHandler<ScriptFailedToParseEventArgs> ScriptFailedToParse;
        /// <summary>
        /// Fired when virtual machine parses script. This event is also fired for all known and uncollected
        /// scripts upon enabling debugger.
        /// </summary>
        public event EventHandler<ScriptParsedEventArgs> ScriptParsed;

        /// <summary>
        /// Continues execution until specific location is reached.
        /// </summary>
        public async Task<ContinueToLocationCommandResponse> ContinueToLocation(ContinueToLocationCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ContinueToLocationCommandSettings, ContinueToLocationCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Disables debugger for given page.
        /// </summary>
        public async Task<DisableCommandResponse> Disable(DisableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DisableCommandSettings, DisableCommandResponse>(command ?? new DisableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables debugger for the given page. Clients should not assume that the debugging has been
        /// enabled until the result for this command is received.
        /// </summary>
        public async Task<EnableCommandResponse> Enable(EnableCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EnableCommandSettings, EnableCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Evaluates expression on a given call frame.
        /// </summary>
        public async Task<EvaluateOnCallFrameCommandResponse> EvaluateOnCallFrame(EvaluateOnCallFrameCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EvaluateOnCallFrameCommandSettings, EvaluateOnCallFrameCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns possible locations for breakpoint. scriptId in start and end range locations should be
        /// the same.
        /// </summary>
        public async Task<GetPossibleBreakpointsCommandResponse> GetPossibleBreakpoints(GetPossibleBreakpointsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetPossibleBreakpointsCommandSettings, GetPossibleBreakpointsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns source for the script with given id.
        /// </summary>
        public async Task<GetScriptSourceCommandResponse> GetScriptSource(GetScriptSourceCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetScriptSourceCommandSettings, GetScriptSourceCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns stack trace with given `stackTraceId`.
        /// </summary>
        public async Task<GetStackTraceCommandResponse> GetStackTrace(GetStackTraceCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetStackTraceCommandSettings, GetStackTraceCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Stops on the next JavaScript statement.
        /// </summary>
        public async Task<PauseCommandResponse> Pause(PauseCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<PauseCommandSettings, PauseCommandResponse>(command ?? new PauseCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// pauseOnAsyncCall
        /// </summary>
        public async Task<PauseOnAsyncCallCommandResponse> PauseOnAsyncCall(PauseOnAsyncCallCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<PauseOnAsyncCallCommandSettings, PauseOnAsyncCallCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Removes JavaScript breakpoint.
        /// </summary>
        public async Task<RemoveBreakpointCommandResponse> RemoveBreakpoint(RemoveBreakpointCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RemoveBreakpointCommandSettings, RemoveBreakpointCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Restarts particular call frame from the beginning.
        /// </summary>
        public async Task<RestartFrameCommandResponse> RestartFrame(RestartFrameCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RestartFrameCommandSettings, RestartFrameCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Resumes JavaScript execution.
        /// </summary>
        public async Task<ResumeCommandResponse> Resume(ResumeCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ResumeCommandSettings, ResumeCommandResponse>(command ?? new ResumeCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Searches for given string in script content.
        /// </summary>
        public async Task<SearchInContentCommandResponse> SearchInContent(SearchInContentCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SearchInContentCommandSettings, SearchInContentCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables or disables async call stacks tracking.
        /// </summary>
        public async Task<SetAsyncCallStackDepthCommandResponse> SetAsyncCallStackDepth(SetAsyncCallStackDepthCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetAsyncCallStackDepthCommandSettings, SetAsyncCallStackDepthCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Replace previous blackbox patterns with passed ones. Forces backend to skip stepping/pausing in
        /// scripts with url matching one of the patterns. VM will try to leave blackboxed script by
        /// performing 'step in' several times, finally resorting to 'step out' if unsuccessful.
        /// </summary>
        public async Task<SetBlackboxPatternsCommandResponse> SetBlackboxPatterns(SetBlackboxPatternsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetBlackboxPatternsCommandSettings, SetBlackboxPatternsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Makes backend skip steps in the script in blackboxed ranges. VM will try leave blacklisted
        /// scripts by performing 'step in' several times, finally resorting to 'step out' if unsuccessful.
        /// Positions array contains positions where blackbox state is changed. First interval isn't
        /// blackboxed. Array should be sorted.
        /// </summary>
        public async Task<SetBlackboxedRangesCommandResponse> SetBlackboxedRanges(SetBlackboxedRangesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetBlackboxedRangesCommandSettings, SetBlackboxedRangesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets JavaScript breakpoint at a given location.
        /// </summary>
        public async Task<SetBreakpointCommandResponse> SetBreakpoint(SetBreakpointCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetBreakpointCommandSettings, SetBreakpointCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets JavaScript breakpoint at given location specified either by URL or URL regex. Once this
        /// command is issued, all existing parsed scripts will have breakpoints resolved and returned in
        /// `locations` property. Further matching script parsing will result in subsequent
        /// `breakpointResolved` events issued. This logical breakpoint will survive page reloads.
        /// </summary>
        public async Task<SetBreakpointByUrlCommandResponse> SetBreakpointByUrl(SetBreakpointByUrlCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetBreakpointByUrlCommandSettings, SetBreakpointByUrlCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets JavaScript breakpoint before each call to the given function.
        /// If another function was created from the same source as a given one,
        /// calling it will also trigger the breakpoint.
        /// </summary>
        public async Task<SetBreakpointOnFunctionCallCommandResponse> SetBreakpointOnFunctionCall(SetBreakpointOnFunctionCallCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetBreakpointOnFunctionCallCommandSettings, SetBreakpointOnFunctionCallCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Activates / deactivates all breakpoints on the page.
        /// </summary>
        public async Task<SetBreakpointsActiveCommandResponse> SetBreakpointsActive(SetBreakpointsActiveCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetBreakpointsActiveCommandSettings, SetBreakpointsActiveCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Defines pause on exceptions state. Can be set to stop on all exceptions, uncaught exceptions or
        /// no exceptions. Initial pause on exceptions state is `none`.
        /// </summary>
        public async Task<SetPauseOnExceptionsCommandResponse> SetPauseOnExceptions(SetPauseOnExceptionsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetPauseOnExceptionsCommandSettings, SetPauseOnExceptionsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Changes return value in top frame. Available only at return break position.
        /// </summary>
        public async Task<SetReturnValueCommandResponse> SetReturnValue(SetReturnValueCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetReturnValueCommandSettings, SetReturnValueCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Edits JavaScript source live.
        /// </summary>
        public async Task<SetScriptSourceCommandResponse> SetScriptSource(SetScriptSourceCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetScriptSourceCommandSettings, SetScriptSourceCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Makes page not interrupt on any pauses (breakpoint, exception, dom exception etc).
        /// </summary>
        public async Task<SetSkipAllPausesCommandResponse> SetSkipAllPauses(SetSkipAllPausesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetSkipAllPausesCommandSettings, SetSkipAllPausesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Changes value of variable in a callframe. Object-based scopes are not supported and must be
        /// mutated manually.
        /// </summary>
        public async Task<SetVariableValueCommandResponse> SetVariableValue(SetVariableValueCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetVariableValueCommandSettings, SetVariableValueCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Steps into the function call.
        /// </summary>
        public async Task<StepIntoCommandResponse> StepInto(StepIntoCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StepIntoCommandSettings, StepIntoCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Steps out of the function call.
        /// </summary>
        public async Task<StepOutCommandResponse> StepOut(StepOutCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StepOutCommandSettings, StepOutCommandResponse>(command ?? new StepOutCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Steps over the statement.
        /// </summary>
        public async Task<StepOverCommandResponse> StepOver(StepOverCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StepOverCommandSettings, StepOverCommandResponse>(command ?? new StepOverCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
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

        private void OnBreakpointResolved(object rawEventArgs)
        {
            BreakpointResolvedEventArgs e = rawEventArgs as BreakpointResolvedEventArgs;
            if (e != null && BreakpointResolved != null)
            {
                BreakpointResolved(this, e);
            }
        }
        private void OnPaused(object rawEventArgs)
        {
            PausedEventArgs e = rawEventArgs as PausedEventArgs;
            if (e != null && Paused != null)
            {
                Paused(this, e);
            }
        }
        private void OnResumed(object rawEventArgs)
        {
            ResumedEventArgs e = rawEventArgs as ResumedEventArgs;
            if (e != null && Resumed != null)
            {
                Resumed(this, e);
            }
        }
        private void OnScriptFailedToParse(object rawEventArgs)
        {
            ScriptFailedToParseEventArgs e = rawEventArgs as ScriptFailedToParseEventArgs;
            if (e != null && ScriptFailedToParse != null)
            {
                ScriptFailedToParse(this, e);
            }
        }
        private void OnScriptParsed(object rawEventArgs)
        {
            ScriptParsedEventArgs e = rawEventArgs as ScriptParsedEventArgs;
            if (e != null && ScriptParsed != null)
            {
                ScriptParsed(this, e);
            }
        }
    }
}