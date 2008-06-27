package org.openqa.selenium;

public interface Alert {
    void dimiss();

    void accept();

    String getText();
}
