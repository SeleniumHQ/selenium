using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using System;

namespace OpenQA.Selenium.BiDi.Modules.Network;

public record ResponseCompletedEventArgs(BiDi BiDi, BrowsingContext.BrowsingContext Context, bool IsBlocked, Navigation Navigation, long RedirectCount, RequestData Request, DateTimeOffset Timestamp, ResponseData Response)
    : BaseParametersEventArgs(BiDi, Context, IsBlocked, Navigation, RedirectCount, Request, Timestamp);
