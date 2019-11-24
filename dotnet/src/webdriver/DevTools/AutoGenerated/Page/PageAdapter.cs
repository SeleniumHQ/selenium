namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Page domain to simplify the command interface.
    /// </summary>
    public class PageAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Page";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public PageAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
            m_eventMap["domContentEventFired"] = new DevToolsEventData(typeof(DomContentEventFiredEventArgs), OnDomContentEventFired);
            m_eventMap["frameAttached"] = new DevToolsEventData(typeof(FrameAttachedEventArgs), OnFrameAttached);
            m_eventMap["frameClearedScheduledNavigation"] = new DevToolsEventData(typeof(FrameClearedScheduledNavigationEventArgs), OnFrameClearedScheduledNavigation);
            m_eventMap["frameDetached"] = new DevToolsEventData(typeof(FrameDetachedEventArgs), OnFrameDetached);
            m_eventMap["frameNavigated"] = new DevToolsEventData(typeof(FrameNavigatedEventArgs), OnFrameNavigated);
            m_eventMap["frameResized"] = new DevToolsEventData(typeof(FrameResizedEventArgs), OnFrameResized);
            m_eventMap["frameRequestedNavigation"] = new DevToolsEventData(typeof(FrameRequestedNavigationEventArgs), OnFrameRequestedNavigation);
            m_eventMap["frameScheduledNavigation"] = new DevToolsEventData(typeof(FrameScheduledNavigationEventArgs), OnFrameScheduledNavigation);
            m_eventMap["frameStartedLoading"] = new DevToolsEventData(typeof(FrameStartedLoadingEventArgs), OnFrameStartedLoading);
            m_eventMap["frameStoppedLoading"] = new DevToolsEventData(typeof(FrameStoppedLoadingEventArgs), OnFrameStoppedLoading);
            m_eventMap["interstitialHidden"] = new DevToolsEventData(typeof(InterstitialHiddenEventArgs), OnInterstitialHidden);
            m_eventMap["interstitialShown"] = new DevToolsEventData(typeof(InterstitialShownEventArgs), OnInterstitialShown);
            m_eventMap["javascriptDialogClosed"] = new DevToolsEventData(typeof(JavascriptDialogClosedEventArgs), OnJavascriptDialogClosed);
            m_eventMap["javascriptDialogOpening"] = new DevToolsEventData(typeof(JavascriptDialogOpeningEventArgs), OnJavascriptDialogOpening);
            m_eventMap["lifecycleEvent"] = new DevToolsEventData(typeof(LifecycleEventEventArgs), OnLifecycleEvent);
            m_eventMap["loadEventFired"] = new DevToolsEventData(typeof(LoadEventFiredEventArgs), OnLoadEventFired);
            m_eventMap["navigatedWithinDocument"] = new DevToolsEventData(typeof(NavigatedWithinDocumentEventArgs), OnNavigatedWithinDocument);
            m_eventMap["screencastFrame"] = new DevToolsEventData(typeof(ScreencastFrameEventArgs), OnScreencastFrame);
            m_eventMap["screencastVisibilityChanged"] = new DevToolsEventData(typeof(ScreencastVisibilityChangedEventArgs), OnScreencastVisibilityChanged);
            m_eventMap["windowOpen"] = new DevToolsEventData(typeof(WindowOpenEventArgs), OnWindowOpen);
            m_eventMap["compilationCacheProduced"] = new DevToolsEventData(typeof(CompilationCacheProducedEventArgs), OnCompilationCacheProduced);
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }

        /// <summary>
        /// domContentEventFired
        /// </summary>
        public event EventHandler<DomContentEventFiredEventArgs> DomContentEventFired;
        /// <summary>
        /// Fired when frame has been attached to its parent.
        /// </summary>
        public event EventHandler<FrameAttachedEventArgs> FrameAttached;
        /// <summary>
        /// Fired when frame no longer has a scheduled navigation.
        /// </summary>
        public event EventHandler<FrameClearedScheduledNavigationEventArgs> FrameClearedScheduledNavigation;
        /// <summary>
        /// Fired when frame has been detached from its parent.
        /// </summary>
        public event EventHandler<FrameDetachedEventArgs> FrameDetached;
        /// <summary>
        /// Fired once navigation of the frame has completed. Frame is now associated with the new loader.
        /// </summary>
        public event EventHandler<FrameNavigatedEventArgs> FrameNavigated;
        /// <summary>
        /// frameResized
        /// </summary>
        public event EventHandler<FrameResizedEventArgs> FrameResized;
        /// <summary>
        /// Fired when a renderer-initiated navigation is requested.
        /// Navigation may still be cancelled after the event is issued.
        /// </summary>
        public event EventHandler<FrameRequestedNavigationEventArgs> FrameRequestedNavigation;
        /// <summary>
        /// Fired when frame schedules a potential navigation.
        /// </summary>
        public event EventHandler<FrameScheduledNavigationEventArgs> FrameScheduledNavigation;
        /// <summary>
        /// Fired when frame has started loading.
        /// </summary>
        public event EventHandler<FrameStartedLoadingEventArgs> FrameStartedLoading;
        /// <summary>
        /// Fired when frame has stopped loading.
        /// </summary>
        public event EventHandler<FrameStoppedLoadingEventArgs> FrameStoppedLoading;
        /// <summary>
        /// Fired when interstitial page was hidden
        /// </summary>
        public event EventHandler<InterstitialHiddenEventArgs> InterstitialHidden;
        /// <summary>
        /// Fired when interstitial page was shown
        /// </summary>
        public event EventHandler<InterstitialShownEventArgs> InterstitialShown;
        /// <summary>
        /// Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) has been
        /// closed.
        /// </summary>
        public event EventHandler<JavascriptDialogClosedEventArgs> JavascriptDialogClosed;
        /// <summary>
        /// Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) is about to
        /// open.
        /// </summary>
        public event EventHandler<JavascriptDialogOpeningEventArgs> JavascriptDialogOpening;
        /// <summary>
        /// Fired for top level page lifecycle events such as navigation, load, paint, etc.
        /// </summary>
        public event EventHandler<LifecycleEventEventArgs> LifecycleEvent;
        /// <summary>
        /// loadEventFired
        /// </summary>
        public event EventHandler<LoadEventFiredEventArgs> LoadEventFired;
        /// <summary>
        /// Fired when same-document navigation happens, e.g. due to history API usage or anchor navigation.
        /// </summary>
        public event EventHandler<NavigatedWithinDocumentEventArgs> NavigatedWithinDocument;
        /// <summary>
        /// Compressed image data requested by the `startScreencast`.
        /// </summary>
        public event EventHandler<ScreencastFrameEventArgs> ScreencastFrame;
        /// <summary>
        /// Fired when the page with currently enabled screencast was shown or hidden `.
        /// </summary>
        public event EventHandler<ScreencastVisibilityChangedEventArgs> ScreencastVisibilityChanged;
        /// <summary>
        /// Fired when a new window is going to be opened, via window.open(), link click, form submission,
        /// etc.
        /// </summary>
        public event EventHandler<WindowOpenEventArgs> WindowOpen;
        /// <summary>
        /// Issued for every compilation cache generated. Is only available
        /// if Page.setGenerateCompilationCache is enabled.
        /// </summary>
        public event EventHandler<CompilationCacheProducedEventArgs> CompilationCacheProduced;

        /// <summary>
        /// Deprecated, please use addScriptToEvaluateOnNewDocument instead.
        /// </summary>
        public async Task<AddScriptToEvaluateOnLoadCommandResponse> AddScriptToEvaluateOnLoad(AddScriptToEvaluateOnLoadCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<AddScriptToEvaluateOnLoadCommandSettings, AddScriptToEvaluateOnLoadCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Evaluates given script in every frame upon creation (before loading frame's scripts).
        /// </summary>
        public async Task<AddScriptToEvaluateOnNewDocumentCommandResponse> AddScriptToEvaluateOnNewDocument(AddScriptToEvaluateOnNewDocumentCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<AddScriptToEvaluateOnNewDocumentCommandSettings, AddScriptToEvaluateOnNewDocumentCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Brings page to front (activates tab).
        /// </summary>
        public async Task<BringToFrontCommandResponse> BringToFront(BringToFrontCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<BringToFrontCommandSettings, BringToFrontCommandResponse>(command ?? new BringToFrontCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Capture page screenshot.
        /// </summary>
        public async Task<CaptureScreenshotCommandResponse> CaptureScreenshot(CaptureScreenshotCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CaptureScreenshotCommandSettings, CaptureScreenshotCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns a snapshot of the page as a string. For MHTML format, the serialization includes
        /// iframes, shadow DOM, external resources, and element-inline styles.
        /// </summary>
        public async Task<CaptureSnapshotCommandResponse> CaptureSnapshot(CaptureSnapshotCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CaptureSnapshotCommandSettings, CaptureSnapshotCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Clears the overriden device metrics.
        /// </summary>
        public async Task<ClearDeviceMetricsOverrideCommandResponse> ClearDeviceMetricsOverride(ClearDeviceMetricsOverrideCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ClearDeviceMetricsOverrideCommandSettings, ClearDeviceMetricsOverrideCommandResponse>(command ?? new ClearDeviceMetricsOverrideCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Clears the overridden Device Orientation.
        /// </summary>
        public async Task<ClearDeviceOrientationOverrideCommandResponse> ClearDeviceOrientationOverride(ClearDeviceOrientationOverrideCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ClearDeviceOrientationOverrideCommandSettings, ClearDeviceOrientationOverrideCommandResponse>(command ?? new ClearDeviceOrientationOverrideCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Clears the overriden Geolocation Position and Error.
        /// </summary>
        public async Task<ClearGeolocationOverrideCommandResponse> ClearGeolocationOverride(ClearGeolocationOverrideCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ClearGeolocationOverrideCommandSettings, ClearGeolocationOverrideCommandResponse>(command ?? new ClearGeolocationOverrideCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Creates an isolated world for the given frame.
        /// </summary>
        public async Task<CreateIsolatedWorldCommandResponse> CreateIsolatedWorld(CreateIsolatedWorldCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CreateIsolatedWorldCommandSettings, CreateIsolatedWorldCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Deletes browser cookie with given name, domain and path.
        /// </summary>
        public async Task<DeleteCookieCommandResponse> DeleteCookie(DeleteCookieCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DeleteCookieCommandSettings, DeleteCookieCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Disables page domain notifications.
        /// </summary>
        public async Task<DisableCommandResponse> Disable(DisableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DisableCommandSettings, DisableCommandResponse>(command ?? new DisableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables page domain notifications.
        /// </summary>
        public async Task<EnableCommandResponse> Enable(EnableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EnableCommandSettings, EnableCommandResponse>(command ?? new EnableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// getAppManifest
        /// </summary>
        public async Task<GetAppManifestCommandResponse> GetAppManifest(GetAppManifestCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetAppManifestCommandSettings, GetAppManifestCommandResponse>(command ?? new GetAppManifestCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// getInstallabilityErrors
        /// </summary>
        public async Task<GetInstallabilityErrorsCommandResponse> GetInstallabilityErrors(GetInstallabilityErrorsCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetInstallabilityErrorsCommandSettings, GetInstallabilityErrorsCommandResponse>(command ?? new GetInstallabilityErrorsCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns all browser cookies. Depending on the backend support, will return detailed cookie
        /// information in the `cookies` field.
        /// </summary>
        public async Task<GetCookiesCommandResponse> GetCookies(GetCookiesCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetCookiesCommandSettings, GetCookiesCommandResponse>(command ?? new GetCookiesCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns present frame tree structure.
        /// </summary>
        public async Task<GetFrameTreeCommandResponse> GetFrameTree(GetFrameTreeCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetFrameTreeCommandSettings, GetFrameTreeCommandResponse>(command ?? new GetFrameTreeCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns metrics relating to the layouting of the page, such as viewport bounds/scale.
        /// </summary>
        public async Task<GetLayoutMetricsCommandResponse> GetLayoutMetrics(GetLayoutMetricsCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetLayoutMetricsCommandSettings, GetLayoutMetricsCommandResponse>(command ?? new GetLayoutMetricsCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns navigation history for the current page.
        /// </summary>
        public async Task<GetNavigationHistoryCommandResponse> GetNavigationHistory(GetNavigationHistoryCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetNavigationHistoryCommandSettings, GetNavigationHistoryCommandResponse>(command ?? new GetNavigationHistoryCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Resets navigation history for the current page.
        /// </summary>
        public async Task<ResetNavigationHistoryCommandResponse> ResetNavigationHistory(ResetNavigationHistoryCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ResetNavigationHistoryCommandSettings, ResetNavigationHistoryCommandResponse>(command ?? new ResetNavigationHistoryCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns content of the given resource.
        /// </summary>
        public async Task<GetResourceContentCommandResponse> GetResourceContent(GetResourceContentCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetResourceContentCommandSettings, GetResourceContentCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns present frame / resource tree structure.
        /// </summary>
        public async Task<GetResourceTreeCommandResponse> GetResourceTree(GetResourceTreeCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetResourceTreeCommandSettings, GetResourceTreeCommandResponse>(command ?? new GetResourceTreeCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Accepts or dismisses a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload).
        /// </summary>
        public async Task<HandleJavaScriptDialogCommandResponse> HandleJavaScriptDialog(HandleJavaScriptDialogCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<HandleJavaScriptDialogCommandSettings, HandleJavaScriptDialogCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Navigates current page to the given URL.
        /// </summary>
        public async Task<NavigateCommandResponse> Navigate(NavigateCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<NavigateCommandSettings, NavigateCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Navigates current page to the given history entry.
        /// </summary>
        public async Task<NavigateToHistoryEntryCommandResponse> NavigateToHistoryEntry(NavigateToHistoryEntryCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<NavigateToHistoryEntryCommandSettings, NavigateToHistoryEntryCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Print page as PDF.
        /// </summary>
        public async Task<PrintToPDFCommandResponse> PrintToPDF(PrintToPDFCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<PrintToPDFCommandSettings, PrintToPDFCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Reloads given page optionally ignoring the cache.
        /// </summary>
        public async Task<ReloadCommandResponse> Reload(ReloadCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ReloadCommandSettings, ReloadCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Deprecated, please use removeScriptToEvaluateOnNewDocument instead.
        /// </summary>
        public async Task<RemoveScriptToEvaluateOnLoadCommandResponse> RemoveScriptToEvaluateOnLoad(RemoveScriptToEvaluateOnLoadCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RemoveScriptToEvaluateOnLoadCommandSettings, RemoveScriptToEvaluateOnLoadCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Removes given script from the list.
        /// </summary>
        public async Task<RemoveScriptToEvaluateOnNewDocumentCommandResponse> RemoveScriptToEvaluateOnNewDocument(RemoveScriptToEvaluateOnNewDocumentCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RemoveScriptToEvaluateOnNewDocumentCommandSettings, RemoveScriptToEvaluateOnNewDocumentCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Acknowledges that a screencast frame has been received by the frontend.
        /// </summary>
        public async Task<ScreencastFrameAckCommandResponse> ScreencastFrameAck(ScreencastFrameAckCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ScreencastFrameAckCommandSettings, ScreencastFrameAckCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Searches for given string in resource content.
        /// </summary>
        public async Task<SearchInResourceCommandResponse> SearchInResource(SearchInResourceCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SearchInResourceCommandSettings, SearchInResourceCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enable Chrome's experimental ad filter on all sites.
        /// </summary>
        public async Task<SetAdBlockingEnabledCommandResponse> SetAdBlockingEnabled(SetAdBlockingEnabledCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetAdBlockingEnabledCommandSettings, SetAdBlockingEnabledCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enable page Content Security Policy by-passing.
        /// </summary>
        public async Task<SetBypassCSPCommandResponse> SetBypassCSP(SetBypassCSPCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetBypassCSPCommandSettings, SetBypassCSPCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Overrides the values of device screen dimensions (window.screen.width, window.screen.height,
        /// window.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media
        /// query results).
        /// </summary>
        public async Task<SetDeviceMetricsOverrideCommandResponse> SetDeviceMetricsOverride(SetDeviceMetricsOverrideCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDeviceMetricsOverrideCommandSettings, SetDeviceMetricsOverrideCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Overrides the Device Orientation.
        /// </summary>
        public async Task<SetDeviceOrientationOverrideCommandResponse> SetDeviceOrientationOverride(SetDeviceOrientationOverrideCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDeviceOrientationOverrideCommandSettings, SetDeviceOrientationOverrideCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Set generic font families.
        /// </summary>
        public async Task<SetFontFamiliesCommandResponse> SetFontFamilies(SetFontFamiliesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetFontFamiliesCommandSettings, SetFontFamiliesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Set default font sizes.
        /// </summary>
        public async Task<SetFontSizesCommandResponse> SetFontSizes(SetFontSizesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetFontSizesCommandSettings, SetFontSizesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets given markup as the document's HTML.
        /// </summary>
        public async Task<SetDocumentContentCommandResponse> SetDocumentContent(SetDocumentContentCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDocumentContentCommandSettings, SetDocumentContentCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Set the behavior when downloading a file.
        /// </summary>
        public async Task<SetDownloadBehaviorCommandResponse> SetDownloadBehavior(SetDownloadBehaviorCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDownloadBehaviorCommandSettings, SetDownloadBehaviorCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position
        /// unavailable.
        /// </summary>
        public async Task<SetGeolocationOverrideCommandResponse> SetGeolocationOverride(SetGeolocationOverrideCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetGeolocationOverrideCommandSettings, SetGeolocationOverrideCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Controls whether page will emit lifecycle events.
        /// </summary>
        public async Task<SetLifecycleEventsEnabledCommandResponse> SetLifecycleEventsEnabled(SetLifecycleEventsEnabledCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetLifecycleEventsEnabledCommandSettings, SetLifecycleEventsEnabledCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Toggles mouse event-based touch event emulation.
        /// </summary>
        public async Task<SetTouchEmulationEnabledCommandResponse> SetTouchEmulationEnabled(SetTouchEmulationEnabledCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetTouchEmulationEnabledCommandSettings, SetTouchEmulationEnabledCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Starts sending each frame using the `screencastFrame` event.
        /// </summary>
        public async Task<StartScreencastCommandResponse> StartScreencast(StartScreencastCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StartScreencastCommandSettings, StartScreencastCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Force the page stop all navigations and pending resource fetches.
        /// </summary>
        public async Task<StopLoadingCommandResponse> StopLoading(StopLoadingCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StopLoadingCommandSettings, StopLoadingCommandResponse>(command ?? new StopLoadingCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Crashes renderer on the IO thread, generates minidumps.
        /// </summary>
        public async Task<CrashCommandResponse> Crash(CrashCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CrashCommandSettings, CrashCommandResponse>(command ?? new CrashCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Tries to close page, running its beforeunload hooks, if any.
        /// </summary>
        public async Task<CloseCommandResponse> Close(CloseCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CloseCommandSettings, CloseCommandResponse>(command ?? new CloseCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Tries to update the web lifecycle state of the page.
        /// It will transition the page to the given state according to:
        /// https://github.com/WICG/web-lifecycle/
        /// </summary>
        public async Task<SetWebLifecycleStateCommandResponse> SetWebLifecycleState(SetWebLifecycleStateCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetWebLifecycleStateCommandSettings, SetWebLifecycleStateCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Stops sending each frame in the `screencastFrame`.
        /// </summary>
        public async Task<StopScreencastCommandResponse> StopScreencast(StopScreencastCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StopScreencastCommandSettings, StopScreencastCommandResponse>(command ?? new StopScreencastCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Forces compilation cache to be generated for every subresource script.
        /// </summary>
        public async Task<SetProduceCompilationCacheCommandResponse> SetProduceCompilationCache(SetProduceCompilationCacheCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetProduceCompilationCacheCommandSettings, SetProduceCompilationCacheCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Seeds compilation cache for given url. Compilation cache does not survive
        /// cross-process navigation.
        /// </summary>
        public async Task<AddCompilationCacheCommandResponse> AddCompilationCache(AddCompilationCacheCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<AddCompilationCacheCommandSettings, AddCompilationCacheCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Clears seeded compilation cache.
        /// </summary>
        public async Task<ClearCompilationCacheCommandResponse> ClearCompilationCache(ClearCompilationCacheCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ClearCompilationCacheCommandSettings, ClearCompilationCacheCommandResponse>(command ?? new ClearCompilationCacheCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Generates a report for testing.
        /// </summary>
        public async Task<GenerateTestReportCommandResponse> GenerateTestReport(GenerateTestReportCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GenerateTestReportCommandSettings, GenerateTestReportCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Pauses page execution. Can be resumed using generic Runtime.runIfWaitingForDebugger.
        /// </summary>
        public async Task<WaitForDebuggerCommandResponse> WaitForDebugger(WaitForDebuggerCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<WaitForDebuggerCommandSettings, WaitForDebuggerCommandResponse>(command ?? new WaitForDebuggerCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
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

        private void OnDomContentEventFired(object rawEventArgs)
        {
            DomContentEventFiredEventArgs e = rawEventArgs as DomContentEventFiredEventArgs;
            if (e != null && DomContentEventFired != null)
            {
                DomContentEventFired(this, e);
            }
        }
        private void OnFrameAttached(object rawEventArgs)
        {
            FrameAttachedEventArgs e = rawEventArgs as FrameAttachedEventArgs;
            if (e != null && FrameAttached != null)
            {
                FrameAttached(this, e);
            }
        }
        private void OnFrameClearedScheduledNavigation(object rawEventArgs)
        {
            FrameClearedScheduledNavigationEventArgs e = rawEventArgs as FrameClearedScheduledNavigationEventArgs;
            if (e != null && FrameClearedScheduledNavigation != null)
            {
                FrameClearedScheduledNavigation(this, e);
            }
        }
        private void OnFrameDetached(object rawEventArgs)
        {
            FrameDetachedEventArgs e = rawEventArgs as FrameDetachedEventArgs;
            if (e != null && FrameDetached != null)
            {
                FrameDetached(this, e);
            }
        }
        private void OnFrameNavigated(object rawEventArgs)
        {
            FrameNavigatedEventArgs e = rawEventArgs as FrameNavigatedEventArgs;
            if (e != null && FrameNavigated != null)
            {
                FrameNavigated(this, e);
            }
        }
        private void OnFrameResized(object rawEventArgs)
        {
            FrameResizedEventArgs e = rawEventArgs as FrameResizedEventArgs;
            if (e != null && FrameResized != null)
            {
                FrameResized(this, e);
            }
        }
        private void OnFrameRequestedNavigation(object rawEventArgs)
        {
            FrameRequestedNavigationEventArgs e = rawEventArgs as FrameRequestedNavigationEventArgs;
            if (e != null && FrameRequestedNavigation != null)
            {
                FrameRequestedNavigation(this, e);
            }
        }
        private void OnFrameScheduledNavigation(object rawEventArgs)
        {
            FrameScheduledNavigationEventArgs e = rawEventArgs as FrameScheduledNavigationEventArgs;
            if (e != null && FrameScheduledNavigation != null)
            {
                FrameScheduledNavigation(this, e);
            }
        }
        private void OnFrameStartedLoading(object rawEventArgs)
        {
            FrameStartedLoadingEventArgs e = rawEventArgs as FrameStartedLoadingEventArgs;
            if (e != null && FrameStartedLoading != null)
            {
                FrameStartedLoading(this, e);
            }
        }
        private void OnFrameStoppedLoading(object rawEventArgs)
        {
            FrameStoppedLoadingEventArgs e = rawEventArgs as FrameStoppedLoadingEventArgs;
            if (e != null && FrameStoppedLoading != null)
            {
                FrameStoppedLoading(this, e);
            }
        }
        private void OnInterstitialHidden(object rawEventArgs)
        {
            InterstitialHiddenEventArgs e = rawEventArgs as InterstitialHiddenEventArgs;
            if (e != null && InterstitialHidden != null)
            {
                InterstitialHidden(this, e);
            }
        }
        private void OnInterstitialShown(object rawEventArgs)
        {
            InterstitialShownEventArgs e = rawEventArgs as InterstitialShownEventArgs;
            if (e != null && InterstitialShown != null)
            {
                InterstitialShown(this, e);
            }
        }
        private void OnJavascriptDialogClosed(object rawEventArgs)
        {
            JavascriptDialogClosedEventArgs e = rawEventArgs as JavascriptDialogClosedEventArgs;
            if (e != null && JavascriptDialogClosed != null)
            {
                JavascriptDialogClosed(this, e);
            }
        }
        private void OnJavascriptDialogOpening(object rawEventArgs)
        {
            JavascriptDialogOpeningEventArgs e = rawEventArgs as JavascriptDialogOpeningEventArgs;
            if (e != null && JavascriptDialogOpening != null)
            {
                JavascriptDialogOpening(this, e);
            }
        }
        private void OnLifecycleEvent(object rawEventArgs)
        {
            LifecycleEventEventArgs e = rawEventArgs as LifecycleEventEventArgs;
            if (e != null && LifecycleEvent != null)
            {
                LifecycleEvent(this, e);
            }
        }
        private void OnLoadEventFired(object rawEventArgs)
        {
            LoadEventFiredEventArgs e = rawEventArgs as LoadEventFiredEventArgs;
            if (e != null && LoadEventFired != null)
            {
                LoadEventFired(this, e);
            }
        }
        private void OnNavigatedWithinDocument(object rawEventArgs)
        {
            NavigatedWithinDocumentEventArgs e = rawEventArgs as NavigatedWithinDocumentEventArgs;
            if (e != null && NavigatedWithinDocument != null)
            {
                NavigatedWithinDocument(this, e);
            }
        }
        private void OnScreencastFrame(object rawEventArgs)
        {
            ScreencastFrameEventArgs e = rawEventArgs as ScreencastFrameEventArgs;
            if (e != null && ScreencastFrame != null)
            {
                ScreencastFrame(this, e);
            }
        }
        private void OnScreencastVisibilityChanged(object rawEventArgs)
        {
            ScreencastVisibilityChangedEventArgs e = rawEventArgs as ScreencastVisibilityChangedEventArgs;
            if (e != null && ScreencastVisibilityChanged != null)
            {
                ScreencastVisibilityChanged(this, e);
            }
        }
        private void OnWindowOpen(object rawEventArgs)
        {
            WindowOpenEventArgs e = rawEventArgs as WindowOpenEventArgs;
            if (e != null && WindowOpen != null)
            {
                WindowOpen(this, e);
            }
        }
        private void OnCompilationCacheProduced(object rawEventArgs)
        {
            CompilationCacheProducedEventArgs e = rawEventArgs as CompilationCacheProducedEventArgs;
            if (e != null && CompilationCacheProduced != null)
            {
                CompilationCacheProduced(this, e);
            }
        }
    }
}