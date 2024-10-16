using OpenQA.Selenium.BiDi.Communication;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules;

public abstract class Module(Broker broker)
{
    protected Broker Broker { get; } = broker;
}
