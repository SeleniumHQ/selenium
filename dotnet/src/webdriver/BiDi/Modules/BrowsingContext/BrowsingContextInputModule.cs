using System.Threading.Tasks;
using OpenQA.Selenium.BiDi.Modules.Input;
using System.Collections.Generic;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public class BrowsingContextInputModule(BrowsingContext context, InputModule inputModule)
{
    public Task PerformActionsAsync(IEnumerable<SourceActions> actions, PerformActionsOptions? options = null)
    {
        return inputModule.PerformActionsAsync(context, actions, options);
    }

    public Task ReleaseActionsAsync(ReleaseActionsOptions? options = null)
    {
        return inputModule.ReleaseActionsAsync(context, options);
    }
}
