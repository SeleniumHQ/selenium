package com.googlecode.webdriver.firefox;

import java.lang.reflect.Constructor;

public class Response {
    private final String methodName;
    private final Context context;
    private final String responseText;
    private boolean isError;

    public Response(String methodName, String remainderOfResult) {
        this.methodName = methodName;
        String[] bits = remainderOfResult.split("\n", 4);
        context = new Context(bits[0]);
        isError = "ERROR".equals(bits[1]);
        if (bits.length > 3)
            responseText = bits[3];
        else
            responseText = "";
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

    public void ifNecessaryThrow(Class<? extends RuntimeException> exceptionClass) {
        if (!isError)
            return;

        RuntimeException toThrow = null;
        try {
            Constructor<? extends RuntimeException> constructor = exceptionClass.getConstructor(String.class);
            toThrow = constructor.newInstance(getResponseText());
        } catch (Exception e) {
            throw new RuntimeException(getResponseText());
        }

        throw toThrow;
    }
}
