package org.openqa.selenium.firefox;

import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Constructor;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

public class Response {
	private final JSONObject result;
    private final String methodName;
    private final Context context;
    private final String responseText;
    private boolean isError;

    public Response(String json) {
        try {
            result = new JSONObject(json.trim());

            methodName = (String) result.get("commandName");
            String contextAsString = (String) result.get("context");
            if (contextAsString != null)
                context = new Context(contextAsString);
            else
                context = null;
            responseText = String.valueOf(result.get("response"));

            isError = (Boolean) result.get("isError");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String getCommand() {
        return methodName;
    }

    public Context getContext() {
        return context;
    }

    public String getResponseText() {
        return responseText;
    }

    public boolean isError() {
        return isError;
    }

  public String toString() {
    return result.toString();
  }

  public Object getExtraResult(String fieldName) {
    	try {
			return result.get(fieldName);
		} catch (JSONException e) {
			throw new RuntimeException(e);
		}
    }

    public void ifNecessaryThrow(Class<? extends RuntimeException> exceptionClass) {
        if (!isError)
            return;

        RuntimeException toThrow = null;
        try {
            Constructor<? extends RuntimeException> constructor = exceptionClass.getConstructor(String.class);
            JSONObject info = null;
            try {
                info = new JSONObject(getResponseText());
            } catch (Exception e) {
                toThrow = constructor.newInstance(getResponseText());
            }

            if (info != null) {
                toThrow = constructor.newInstance(String.format("%s: %s", info.get("name"), info.get("message")));
                List<StackTraceElement> stack = new ArrayList<StackTraceElement>();
                for (String trace : ((String) info.get("stack")).split("\n")) {
                    StackTraceElement element = createStackTraceElement(trace);
                    if (element != null)
                        stack.add(element);
                }

                stack.addAll(Arrays.asList(toThrow.getStackTrace()));
                toThrow.setStackTrace(stack.toArray(new StackTraceElement[0]));
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(getResponseText());
        }

        throw toThrow;
    }

    private StackTraceElement createStackTraceElement(String trace) {
        try {
            String[] parts = trace.split(" -> ");
            int splitAt = parts[1].lastIndexOf(":");
            int lineNumber = Integer.parseInt(parts[1].substring(splitAt + 1));
            return new StackTraceElement("FirefoxDriver", parts[0], parts[1].substring(0, splitAt), lineNumber);
        } catch (Exception e) {
            return null;
        }
    }
}
