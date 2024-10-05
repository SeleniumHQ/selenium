using System.Collections.Generic;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Session;

public class CapabilitiesRequest
{
    public CapabilityRequest? AlwaysMatch { get; set; }

    public IEnumerable<CapabilityRequest>? FirstMatch { get; set; }
}
