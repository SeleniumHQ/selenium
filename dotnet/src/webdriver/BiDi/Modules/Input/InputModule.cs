using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;
using System.Threading.Tasks;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Input;

public sealed class InputModule(Broker broker) : Module(broker)
{
    public async Task PerformActionsAsync(BrowsingContext.BrowsingContext context, IEnumerable<SourceActions> actions, PerformActionsOptions? options = null)
    {
        var @params = new PerformActionsCommandParameters(context, actions);

        await Broker.ExecuteCommandAsync(new PerformActionsCommand(@params), options).ConfigureAwait(false);
    }

    public async Task ReleaseActionsAsync(BrowsingContext.BrowsingContext context, ReleaseActionsOptions? options = null)
    {
        var @params = new ReleaseActionsCommandParameters(context);

        await Broker.ExecuteCommandAsync(new ReleaseActionsCommand(@params), options).ConfigureAwait(false);
    }
}
