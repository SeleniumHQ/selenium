/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.thoughtworks.selenium.funnel;

import edu.emory.mathcs.util.concurrent.Executor;
import edu.emory.mathcs.util.concurrent.Executors;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @author Mike Melia
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class Funnel {
    // http://www.webelements.com/webelements/elements/text/Se/key.html
    private static final int SELENIUM_ATOMIC_WEIGHT = 7896;
    private final int port;
    private final OutputStream debugClientRequest;
    private final OutputStream debugClientResponse;
    private final OutputStream debugServerRequest;
    private final OutputStream debugServerResponse;

    public Funnel(int port, OutputStream debugClientRequest, OutputStream debugClientResponse, OutputStream debugServerRequest, OutputStream debugServerResponse) {
        this.port = port;
        this.debugClientRequest = debugClientRequest;
        this.debugClientResponse = debugClientResponse;
        this.debugServerRequest = debugServerRequest;
        this.debugServerResponse = debugServerResponse;
    }

    public Funnel() {
        this(SELENIUM_ATOMIC_WEIGHT, System.out, System.out, System.out, System.out);
    }

    public void start() throws IOException {
        Executor executor = Executors.newCachedThreadPool();
        ServerSocket serverSocket = new ServerSocket(port);
        while (true) {
            Socket httpClientSocket = serverSocket.accept();
            Client client = new HttpClient(debugServerResponse, debugClientResponse);
            FunnelRequestHandler funnelRequestHandler = new FunnelRequestHandler(client, debugClientRequest, debugClientResponse, debugServerRequest);
            FunnelRunner funnelRunner = new FunnelRunner(httpClientSocket, funnelRequestHandler);
            executor.execute(funnelRunner);
        }
    }

    private class FunnelRunner implements Runnable {
        private Socket httpClientSocket;
        private FunnelRequestHandler funnelRequestHandler;

        public FunnelRunner(Socket httpClientSocket, FunnelRequestHandler funnelRequestHandler) {
            this.httpClientSocket = httpClientSocket;
            this.funnelRequestHandler = funnelRequestHandler;
        }

        public void run() {
            InputStream clientRequest = null;
            OutputStream clientResponse = null;
            try {
                clientRequest = httpClientSocket.getInputStream();
                clientResponse = httpClientSocket.getOutputStream();
                boolean keepAlive = true;
                while (keepAlive) {
                    keepAlive = funnelRequestHandler.handleRequest(clientRequest, clientResponse) && !httpClientSocket.isClosed();
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                close(clientRequest);
                close(clientResponse);
                close(httpClientSocket);
            }
        }

        private void close(InputStream in) {
            try {
                in.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        private void close(OutputStream out) {
            try {
                out.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        private void close(Socket socket) {
            try {
                socket.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) throws IOException {
        new Funnel().start();
    }
}
