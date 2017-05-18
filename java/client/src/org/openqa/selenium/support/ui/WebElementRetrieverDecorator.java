package org.openqa.selenium.support.ui;

public abstract class WebElementRetrieverDecorator implements WebElementRetriever {

  protected final WebElementRetriever decoratedRetriever;

  protected WebElementRetrieverDecorator(WebElementRetriever retriever) {
    this.decoratedRetriever = retriever;
  }

}
