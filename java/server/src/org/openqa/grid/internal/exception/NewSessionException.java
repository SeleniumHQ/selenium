package org.openqa.grid.internal.exception;

import org.openqa.grid.common.exception.GridException;

public class NewSessionException extends GridException {
 
  private static final long serialVersionUID = 6369049863503786020L;

  public NewSessionException(String msg, Throwable t) {
    super(msg, t);
  }

  public NewSessionException(String msg) {
    super(msg);
  }

}
