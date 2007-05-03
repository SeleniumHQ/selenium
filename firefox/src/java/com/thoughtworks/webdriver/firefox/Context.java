package com.thoughtworks.webdriver.firefox;

class Context {
    private final String fromExtension;

    public Context(String fromExtension) {
        if (fromExtension.length() > 0)
           this.fromExtension = fromExtension;
        else
            this.fromExtension = "0 0";
    }

    public String toString() {
        return fromExtension;
    }
}
