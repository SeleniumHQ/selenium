using System;

namespace OpenQA.Selenium.BiDi.Modules.Script;

public class ScriptEvaluateException(EvaluateResultException evaluateResultException) : Exception
{
    private readonly EvaluateResultException _evaluateResultException = evaluateResultException;

    public string Text => _evaluateResultException.ExceptionDetails.Text;

    public long ColumNumber => _evaluateResultException.ExceptionDetails.ColumnNumber;

    public override string Message => $"{Text}{Environment.NewLine}{_evaluateResultException.ExceptionDetails.StackTrace}";
}
