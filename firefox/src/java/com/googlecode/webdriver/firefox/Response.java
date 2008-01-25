package com.googlecode.webdriver.firefox;

class Response {
    private final String methodName;
    private final Context context;
    private final String responseText;

    public Response(String methodName, String remainderOfResult) {
        this.methodName = methodName;
        String[] bits = remainderOfResult.split("\n", 2);
        context = new Context(bits[0]);
        if (bits.length > 1)
            responseText = bits[1];
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
}
