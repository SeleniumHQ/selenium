using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Network;

internal class ContinueResponseCommand(ContinueResponseCommandParameters @params) : Command<ContinueResponseCommandParameters>(@params);

internal record ContinueResponseCommandParameters(Request Request) : CommandParameters
{
    public IEnumerable<SetCookieHeader>? Cookies { get; set; }

    public IEnumerable<AuthCredentials>? Credentials { get; set; }

    public IEnumerable<Header>? Headers { get; set; }

    public string? ReasonPhrase { get; set; }

    public long? StatusCode { get; set; }
}

public record ContinueResponseOptions : CommandOptions
{
    public IEnumerable<SetCookieHeader>? Cookies { get; set; }

    public IEnumerable<AuthCredentials>? Credentials { get; set; }

    public IEnumerable<Header>? Headers { get; set; }

    public string? ReasonPhrase { get; set; }

    public long? StatusCode { get; set; }
}
