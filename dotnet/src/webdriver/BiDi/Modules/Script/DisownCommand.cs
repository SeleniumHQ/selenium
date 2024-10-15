using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Script;

internal class DisownCommand(DisownCommandParameters @params) : Command<DisownCommandParameters>(@params);

internal record DisownCommandParameters(IEnumerable<Handle> Handles, Target Target) : CommandParameters;
