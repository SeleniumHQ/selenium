using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Script;

public record StackTrace(IReadOnlyCollection<StackFrame> CallFrames);
