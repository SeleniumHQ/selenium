using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using System;

namespace OpenQA.Selenium.BiDi.Modules.Network;

public record BeforeRequestSentEventArgs(BiDi BiDi, BrowsingContext.BrowsingContext Context, bool IsBlocked, Navigation Navigation, long RedirectCount, RequestData Request, DateTimeOffset Timestamp, Initiator Initiator)
    : BaseParametersEventArgs(BiDi, Context, IsBlocked, Navigation, RedirectCount, Request, Timestamp);
