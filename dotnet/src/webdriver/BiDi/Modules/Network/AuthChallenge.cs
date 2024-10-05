#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Network;

public record AuthChallenge(string Scheme, string Realm);
