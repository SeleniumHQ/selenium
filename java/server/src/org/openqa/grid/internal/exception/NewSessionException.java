package org.openqa.grid.internal.exception;

public class NewSessionException extends Exception {

 
  private static final long serialVersionUID = 6369049863503786020L;

  public NewSessionException(String msg, Throwable t) {
    super(msg, t);
  }

  public NewSessionException(String msg) {
    super(msg);
  }

}
