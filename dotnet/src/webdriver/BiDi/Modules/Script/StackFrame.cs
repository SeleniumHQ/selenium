namespace OpenQA.Selenium.BiDi.Modules.Script;

public record StackFrame(long LineNumber, long ColumnNumber, string Url, string FunctionName);
