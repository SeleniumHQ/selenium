module org.openqa.selenium.core {
    requires transitive java.logging;

    exports org.openqa.selenium;
    exports org.openqa.selenium.html5;
    exports org.openqa.selenium.interactions;
    exports org.openqa.selenium.interactions.internal;
    exports org.openqa.selenium.interactions.touch;
    exports org.openqa.selenium.internal;
    exports org.openqa.selenium.logging;
    exports org.openqa.selenium.logging.profiler;
    exports org.openqa.selenium.mobile;
}

