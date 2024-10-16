using System.Collections.Generic;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

public record StackTrace(IReadOnlyCollection<StackFrame> CallFrames);
