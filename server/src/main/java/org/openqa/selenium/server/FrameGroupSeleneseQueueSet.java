package org.openqa.selenium.server;
    /*
     * Copyright 2006 BEA, Inc.
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


    import java.util.HashMap;
    import java.util.Map;

    /**
     * <p>Manages a set of SeleneseQueues corresponding to a set of frames in a single browser session.</p>
     * 
     * @author nelsons
     */
    public class FrameGroupSeleneseQueueSet {
        private String currentFrameAddress;
        private Map<String, SeleneseQueue> frameAddressToSeleneseQueue = new HashMap<String, SeleneseQueue>();
        private SeleneseQueue q;
        
        public FrameGroupSeleneseQueueSet() {
            selectFrame("top"); 
        }
        
        public void selectFrame(String frameAddress) {
            currentFrameAddress = frameAddress;
            if (!frameAddressToSeleneseQueue.containsKey(currentFrameAddress)) {
                frameAddressToSeleneseQueue.put(currentFrameAddress, new SeleneseQueue());
            }
            q = frameAddressToSeleneseQueue.get(currentFrameAddress);
        }
        
        /** Schedules the specified command to be retrieved by the next call to
         * handle command result, and returns the result of that command.
         * 
         * @param command - the Selenese command verb
         * @param field - the first Selenese argument (meaning depends on the verb)
         * @param value - the second Selenese argument
         * @return - the command result, defined by the Selenese JavaScript.  "getX" style
         * commands may return data from the browser; other "doX" style commands may just
         * return "OK" or an error message.
         */
        public String doCommand(String command, String field, String value) {
            if (command.equals("selectFrame")) {
                String selectFrameArgument = field;
                for (SeleneseQueue frameQ : frameAddressToSeleneseQueue.values()) {
                    frameQ.doCommand("isFrame", currentFrameAddress, selectFrameArgument);
                }
                boolean newFrameFound = false;
                for (String frameAddress : frameAddressToSeleneseQueue.keySet()) {
                    SeleneseQueue frameQ = frameAddressToSeleneseQueue.get(frameAddress);
                    String frameMatchBooleanString = frameQ.doCommand("isFrame", currentFrameAddress, selectFrameArgument);
                    if ("true".equals(frameMatchBooleanString)) {
                        selectFrame(frameAddress);
                        newFrameFound = true;
                        break;
                    }
                }
                if (!newFrameFound) {
                    throw new RuntimeException("starting from frame " + currentFrameAddress 
                            + ", could not find frame " + selectFrameArgument);
                }
            }
            return q.doCommand(command, field, value);
        }

        /**
         * <p>Accepts a command reply, and retrieves the next command to run.</p>
         * 
         * 
         * @param commandResult - the reply from the previous command, or null
         * @return - the next command to run
         */
        public SeleneseCommand handleCommandResult(String commandResult) {
            return q.handleCommandResult(commandResult);
        }

        /**
         * <p> Throw away a command reply.
         *
         */
        public void discardCommandResult() {
            q.discardCommandResult();
        }

        /**
         * <p> Empty queues, and thereby wake up any threads that are hanging around.
         *
         */
        public void endOfLife() {
            for (SeleneseQueue frameQ : frameAddressToSeleneseQueue.values()) {
                frameQ.endOfLife();
            }
        }

        public SeleneseQueue getCurrentQueue() {
            return q;
        }
    }
