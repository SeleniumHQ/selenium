package org.openqa.selenium.server.commands;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class AddCustomRequestHeaderCommand extends Command {
    private static Map<String, String> headers = new ConcurrentHashMap<String, String>();

    private String key;
    private String value;

    public AddCustomRequestHeaderCommand(String key, String value) {
        this.key = key;
        this.value = value;
    }

    public String execute() {
        headers.put(key, value);

        return "OK";
    }

    public static Map<String, String> getHeaders() {
        return headers;
    }
}
