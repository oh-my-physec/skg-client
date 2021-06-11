from flask import Flask, render_template
from flask import send_from_directory, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO
from mods.usrp_server import USRPServers
import threading

app = Flask(__name__)
## This is required by flask_socketio, don't touch it.
app.config['SECRET_KEY'] = 'secret!'

cors = CORS(app)
socketio = SocketIO(app)

## Auto reload the template, so I don't have to restart
## the server every time :(
app.config['TEMPLATES_AUTO_RELOAD'] = True

## USRP Servers instance.
## The USRPServers class is not thread-safe! Please refer to the source code
## mods.usrp_server.USRPServers
usrp_servers_lock = threading.Semaphore()
usrp_servers = USRPServers()

## Index.
@app.route("/")
def index():
    return render_template("index.html", base_url=request.base_url)

## Host static files, e.g., .js, .css, .jpeg, .png, etc.
@app.route("/static/<path:path>")
def static_assets(path):
    return send_from_directory("static", path)

@socketio.on("connect")
def connected():
    print("websocket connected, with socket.id='{}'".format(request.sid))

@socketio.on("usrp_server_ping")
def usrp_server_test_connection(addr):
    usrp_servers_lock.acquire()
    if not "usrp_server_addr" in addr:
        return {
            "status": "fail",
            "explain": "Please specify the 'usrp_server_addr' field",
        }
    pong = usrp_servers.ping(addr["usrp_server_addr"])
    usrp_servers_lock.release()
    if pong != "pong":
        return {
            "status": "fail",
            "explain": "Cannot connect to usrp server: {}".format(addr["usrp_server_addr"]) }
    return { "status": "ok" }

@socketio.on("usrp_server_load_config")
def usrp_server_load_config(req):
    usrp_servers_lock.acquire()
    if not "usrp_server_addr" in req:
        return {
            "status": "fail",
            "explain": "Please specify the 'usrp_server_addr' field",
        }
    if not "usrp_server_config_fields" in req:
        return {
            "status": "fail",
            "explain": "Please specify the 'usrp_server_config_fields' field",
        }
    usrp_server_config = usrp_servers.load_config(req["usrp_server_addr"],
                                                  req["usrp_server_config_fields"])
    usrp_servers_lock.release()
    return usrp_server_config

@socketio.on("usrp_server_update_config")
def usrp_server_update_config(req):
    usrp_servers_lock.acquire()
    if not "usrp_server_addr" in req:
        return {
            "status": "fail",
            "explain": "Please specify the 'usrp_server_addr' field",
        }
    if not "usrp_server_config" in req:
        return {
            "status": "fail",
            "explain": "Please specify the 'usrp_server_config' field",
        }
    resp = usrp_servers.update_config(req["usrp_server_addr"],
                                      req["usrp_server_config"])
    usrp_servers_lock.release()
    return resp

if __name__ == "__main__":
    socketio.run(app, debug=True)
