import json
import socket
import ssl
import time
import threading
import logging
from urllib.parse import urlparse

from websocket import WebSocketApp, WebSocketException, enableTrace
# enableTrace(True)

logger = logging.getLogger("websocket")

class WebSocketConnection:
    # CONNECTION_ERRORS = [
    #   ConnectionResetError,  # connection is aborted (browser process was killed)
    #   BrokenPipeError  # broken pipe (browser process was killed)
    # ]

    RESPONSE_WAIT_TIMEOUT = 2 # TODO 30
    RESPONSE_WAIT_INTERVAL = 0.1

    MAX_LOG_MESSAGE_SIZE = 9999

    def __init__(self, url):
        self.callback_threads = []
        self.callbacks = {}
        self.messages = {}
        self.id = 0
        self.started = False

        self.session_id = None
        self.url = url

        self.socket_thread = self.attach_socket_listener()
        self.wait_until(lambda: self.started)

    def close(self):
        for thread in self.callback_threads:
            thread.join()
        self.socket_thread.join()
        self.ws.close()

    def send_cmd(self, cmd):
        id = self.next_id()
        payload = next(cmd)
        payload['id'] = id
        if self.session_id:
            payload["sessionId"] = self.session_id
        data = json.dumps(payload)
        logger.warning(f"WebSocket -> {data}"[:self.MAX_LOG_MESSAGE_SIZE])
        self.ws.send(data)
        return self.wait_until(lambda: self.retrieve_message(id, cmd))

    def retrieve_message(self, id, cmd):
        if id in self.messages:
            message = self.messages.pop(id)
            try:
                _ = cmd.send(message["result"])
                raise InternalError("The command's generator function did not exit when expected!")
            except StopIteration as exit:
                return exit.value
        else:
            return None

    def attach_socket_listener(self):
        def on_open(ws):
            self.started = True

        def on_message(ws, message):
            logger.warning(message)
            message = self.process_frame(message)

            if 'method' in message:
                params = message['params']
                for callback in self.callbacks.get(message['method'], []):
                    callback(params)

        def on_error(ws, error):
            logger.warning(f"WebSocket error: {error}")
            ws.close()

        def run_socket():
            # TODO: Support wss
            # self.ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
            self.ws.run_forever()

        self.ws = WebSocketApp(self.url, on_message=on_message, on_error=on_error)
        thread = threading.Thread(target=run_socket)
        thread.start()
        return thread

    def process_frame(self, frame):
        message = frame

        # Firefox will periodically fail on unparsable empty frame
        if not message:
            return {}

        message = json.loads(message)
        logger.warning(f"WebSocket <- {message}"[:self.MAX_LOG_MESSAGE_SIZE])

        if 'id' in message:
            self.messages[message['id']] = message

        return message

    def wait_until(self, condition):
        timeout = self.RESPONSE_WAIT_TIMEOUT
        interval = self.RESPONSE_WAIT_INTERVAL

        while timeout > 0:
            result = condition()
            if result:
                return result
            timeout -= interval
            time.sleep(interval)

    def next_id(self):
        self.id += 1
        return self.id
