using System.Threading.Tasks;
using OpenQA.Selenium.BiDi.Modules.Input;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public class BrowsingContextInputModule(BrowsingContext context, InputModule inputModule)
{
    public Task PerformActionsAsync(IEnumerable<SourceActions> actions, PerformActionsOptions? options = null)
    {
        options ??= new();

        options.Actions = actions;

        return inputModule.PerformActionsAsync(context, options);
    }
}
