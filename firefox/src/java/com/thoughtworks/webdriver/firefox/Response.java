package com.thoughtworks.webdriver.firefox;

class Response {
    private final String methodName;
    private final DocumentLocation location;
    private final String responseText;

    public Response(String methodName, String remainderOfResult) {
        this.methodName = methodName;
        String[] bits = remainderOfResult.split("\n", 2);
        location = new DocumentLocation(bits[0]);
        if (bits.length > 1)
            responseText = bits[1];
        else
            responseText = "";
    }

    public String getCommand() {
        return methodName;
    }

    public DocumentLocation getIdentifier() {
        return location;
    }

    public String getResponseText() {
        return responseText;
    }
}
