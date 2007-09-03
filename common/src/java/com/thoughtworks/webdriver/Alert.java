package com.thoughtworks.webdriver;

public interface Alert {
    void dimiss();

    void accept();

    String getText();
}
