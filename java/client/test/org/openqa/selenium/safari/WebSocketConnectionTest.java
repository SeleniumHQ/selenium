// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.safari;

import static org.hamcrest.Matchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.isA;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;

import com.google.common.util.concurrent.ListenableFuture;

import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.PongWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.net.SocketAddress;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;

/**
 * Tests for {@link WebSocketConnection}.
 */
@RunWith(JUnit4.class)
public class WebSocketConnectionTest {

  private static final String RESPONSE_TEXT = "response-text";

  @Mock private Channel mockChannel;
  @Mock private ChannelFuture mockCloseFuture;
  @Mock private ChannelPipeline mockPipeline;
  @Mock private ChannelHandlerContext mockContext;

  private WebSocketConnection connection;
  private SimpleChannelUpstreamHandler handler;
  private ChannelFutureListener closeListener;

  @Before
  public void setUp() {
    MockitoAnnotations.initMocks(this);

    when(mockChannel.getPipeline()).thenReturn(mockPipeline);
    when(mockChannel.getCloseFuture()).thenReturn(mockCloseFuture);
    when(mockChannel.isOpen()).thenReturn(true);
    when(mockChannel.isConnected()).thenReturn(true);

    connection = new WebSocketConnection(mockChannel);

    ArgumentCaptor<SimpleChannelUpstreamHandler> captor = ArgumentCaptor.forClass(
        SimpleChannelUpstreamHandler.class);
    verify(mockPipeline).addLast(isA(String.class), captor.capture());
    handler = captor.getValue();

    ArgumentCaptor<ChannelFutureListener> listener = ArgumentCaptor.forClass(
        ChannelFutureListener.class);
    verify(mockCloseFuture).addListener(listener.capture());
    closeListener = listener.getValue();
  }

  @Test
  public void doesNothingIfChannelClosesAndThereIsNoPendingResponse() throws Exception {
    closeListener.operationComplete(mockCloseFuture);
    // OK if we get here.
  }

  @Test
  public void throwsIllegalStateOnSendIfChannelIsNotOpen() {
    when(mockChannel.isOpen()).thenReturn(false);
    when(mockChannel.isConnected()).thenReturn(true);

    try {
      connection.send("");
      fail();
    } catch (IllegalStateException e) {
      // Do nothing.
    }
  }

  @Test
  public void throwsIllegalStateOnSendIfChannelIsNotConnected() {
    when(mockChannel.isOpen()).thenReturn(true);
    when(mockChannel.isConnected()).thenReturn(false);

    try {
      connection.send("");
      fail();
    } catch (IllegalStateException e) {
      // Do nothing.
    }
  }

  @Test
  public void throwsIllegalStateIfAttemptIsMadeToSendConcurrentRequests() {
    send("message one");
    try {
      send("message two");
      fail();
    } catch (IllegalStateException expected) {
      // Do nothing.
    }
  }

  @Test
  public void ignoresNonWebSocketFrameEvents() throws Exception {
    MessageEvent e = createMessageEvent(new Object());
    handler.messageReceived(mockContext, e);
    verify(mockContext).sendUpstream(e);
  }

  @Test
  public void doesNothingWhenTextFrameIsReceivedAndThereIsNoPendingResponse() throws Exception {
    handler.messageReceived(
        mockContext, createMessageEvent(new TextWebSocketFrame(RESPONSE_TEXT)));
    verifyZeroInteractions(mockContext);
    // OK if no errors.
  }

  @Test
  public void doesNothingWhenCloseFrameIsReceivedAndThereIsNoPendingResponse() throws Exception {
    handler.messageReceived(mockContext, createMessageEvent(new CloseWebSocketFrame()));
    verifyZeroInteractions(mockContext);
    // OK if no errors.
  }

  @Test
  public void respondsToPingMessages() throws Exception {
    ChannelBuffer data = ChannelBuffers.wrappedBuffer("foobar".getBytes());
    PingWebSocketFrame ping = new PingWebSocketFrame(data);
    handler.messageReceived(mockContext, createMessageEvent(ping));

    ArgumentCaptor<PongWebSocketFrame> pong = ArgumentCaptor.forClass(PongWebSocketFrame.class);
    verify(mockChannel).write(pong.capture());
    assertSame(data, pong.getValue().getBinaryData());
  }

  @Test
  public void ignoresPongMessages() throws Exception {
    handler.messageReceived(mockContext, createMessageEvent(new PongWebSocketFrame()));
    // Ok if no errors.
  }

  @Test
  public void resolvesPendingResponseWhenTextFrameIsReceived() throws Exception {
    ListenableFuture<String> response = send("Hello, world!");
    assertFalse(response.isDone());

    handler.messageReceived(
        mockContext, createMessageEvent(new TextWebSocketFrame(RESPONSE_TEXT)));
    verifyZeroInteractions(mockContext);
    assertTrue(response.isDone());
    assertEquals(RESPONSE_TEXT, response.get());
  }

  @Test
  public void failsPendingResponseIfChannelIsClosed() throws Exception {
    ListenableFuture<String> response = send("Hello, world!");
    assertFalse(response.isDone());

    handler.messageReceived(mockContext, createMessageEvent(new CloseWebSocketFrame()));
    assertTrue(response.isDone());

    try {
      response.get();
      fail();
    } catch (ExecutionException e) {
      assertThat(e.getCause(), instanceOf(ConnectionClosedException.class));
    }
  }

  @Test
  public void canCancelResponse() throws Exception {
    ListenableFuture<String> response = send("Hello, world!");
    assertFalse(response.isDone());

    response.cancel(true);
    assertTrue(response.isDone());
    try {
      response.get();
      fail();
    } catch (CancellationException expected) {
      // Do nothing.
    }

    // Should be able to send another message.
    assertNotSame(response, send("message 2"));
  }

  @Test
  public void canSendAnotherRequestOnceResponseIsReceived() throws Exception {
    ListenableFuture<String> response1 = send("Hello, world!");
    handler.messageReceived(mockContext,
        createMessageEvent(new TextWebSocketFrame("response 1")));

    ListenableFuture<String> response2 = send("Goodbye, world!");
    handler.messageReceived(mockContext,
        createMessageEvent(new TextWebSocketFrame("response 2")));

    assertEquals("response 1", response1.get());
    assertEquals("response 2", response2.get());
  }

  @Test
  public void failsResponseIfWriteOperationFails() throws Exception {
    Throwable t = new Throwable();

    ChannelFuture writeResult = mock(ChannelFuture.class);
    when(writeResult.getCause()).thenReturn(t);
    when(mockChannel.write(isA(TextWebSocketFrame.class))).thenReturn(writeResult);

    ListenableFuture<String> response = connection.send("foobar");
    assertFalse(response.isDone());

    ArgumentCaptor<ChannelFutureListener> listener =
        ArgumentCaptor.forClass(ChannelFutureListener.class);
    verify(writeResult).addListener(listener.capture());

    listener.getValue().operationComplete(writeResult);

    assertTrue(response.isDone());
    try {
      response.get();
      fail();
    } catch (ExecutionException e) {
      assertSame(t, e.getCause());
    }
  }

  @Test
  public void cancelsResponseIfClosedWhileWaiting() throws Exception {
    ListenableFuture<String> response = send("hi");

    ChannelFuture writeResult = mock(ChannelFuture.class);
    when(mockChannel.write(isA(CloseWebSocketFrame.class))).thenReturn(writeResult);

    assertFalse(response.isCancelled());

    connection.close();
    verify(writeResult).addListener(ChannelFutureListener.CLOSE);

    assertTrue(response.isCancelled());
  }

  @Test
  public void failsResponseIfUnhandledChannelExceptionDetected() throws Exception {
    ListenableFuture<String> response = send("hi");

    assertFalse(response.isDone());

    final Throwable cause = new Throwable();
    handler.exceptionCaught(mockContext, new ExceptionEvent() {
      @Override
      public Throwable getCause() {
        return cause;
      }

      @Override
      public Channel getChannel() {
        throw new UnsupportedOperationException();
      }

      @Override
      public ChannelFuture getFuture() {
        throw new UnsupportedOperationException();
      }
    });

    assertTrue(response.isDone());
    try {
      response.get();
      fail();
    } catch (ExecutionException e) {
      assertSame(cause, e.getCause());
    }
  }

  private ListenableFuture<String> send(String message) {
    ArgumentCaptor<TextWebSocketFrame> messageCaptor = ArgumentCaptor.forClass(
        TextWebSocketFrame.class);

    ChannelFuture writeResult = mock(ChannelFuture.class);
    when(mockChannel.write(messageCaptor.capture())).thenReturn(writeResult);

    return connection.send(message);
  }

  private MessageEvent createMessageEvent(final Object message) {
    return new MessageEvent() {
      @Override
      public Object getMessage() {
        return message;
      }

      @Override
      public SocketAddress getRemoteAddress() {
        throw new UnsupportedOperationException();
      }

      @Override
      public Channel getChannel() {
        throw new UnsupportedOperationException();
      }

      @Override
      public ChannelFuture getFuture() {
        throw new UnsupportedOperationException();
      }
    };
  }
}
