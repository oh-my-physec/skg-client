import zmq
import json
from mods.usrp_server.message import PingMessage, LoadConfigMessage, UpdateConfigMessage

## This class is not thread-safe!!
class USRPServers:
    def __init__(self):
        self._zmq_context = zmq.Context()
        self._zmq_socket = {}

    def reuse_or_create_new_socket(self, usrp_server_addr):
        if (usrp_server_addr in self._zmq_socket) and \
           (not self._zmq_socket[usrp_server_addr].closed):
            return self._zmq_socket[usrp_server_addr]
        self._zmq_socket[usrp_server_addr] = self._zmq_context.socket(zmq.REQ)
        ## Set recv timeout.
        self._zmq_socket[usrp_server_addr].setsockopt(zmq.RCVTIMEO, 500)
        self._zmq_socket[usrp_server_addr].setsockopt(zmq.LINGER, 0)

        self._zmq_socket[usrp_server_addr].connect(usrp_server_addr)
        return self._zmq_socket[usrp_server_addr]

    def send(self, usrp_server_addr, msg_bytes):
        socket = self.reuse_or_create_new_socket(usrp_server_addr)
        try:
            socket.send(msg_bytes)
            resp = socket.recv()
            return resp, True
        except Exception as e:
            socket.close()
            return b"", False

    def ping(self, usrp_server_addr):
        socket = self.reuse_or_create_new_socket(usrp_server_addr)
        ping_msg = PingMessage.to_bytes()
        _, ok = self.send(usrp_server_addr, ping_msg)
        if ok:
            return "pong"
        return "offline"

    def load_config(self, usrp_server_addr, fields=[]):
        socket = self.reuse_or_create_new_socket(usrp_server_addr)
        load_config_msg = LoadConfigMessage(1, fields).to_bytes()
        resp, ok = self.send(usrp_server_addr, load_config_msg)
        if not ok:
            return {
                "status": "fail",
                "explain": "Please test the connection to USRP Server first",
            }
        resp = json.loads(resp)
        payload = {}
        for kv in resp["payload"]:
            payload[kv["key"]] = kv["val"]
        return {
            "status": "ok",
            "payload": payload,
        }

    def update_config(self, usrp_server_addr, fields=[]):
        socket = self.reuse_or_create_new_socket(usrp_server_addr)
        update_config_msg = UpdateConfigMessage(1, fields).to_bytes()
        _, ok = self.send(usrp_server_addr, update_config_msg)
        if not ok:
            return {
                "status": "fail",
                "explain": "Please test the connection to USRP Server first",
            }
        return {
            "status": "ok",
        }
