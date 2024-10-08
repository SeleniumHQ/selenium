using System;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public record NavigationInfo(BiDi BiDi, BrowsingContext Context, Navigation Navigation, DateTimeOffset Timestamp, string Url)
    : BrowsingContextEventArgs(BiDi, Context);
