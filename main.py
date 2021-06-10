from flask import Flask, render_template
from flask import send_from_directory, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO

app = Flask(__name__)
## This is required by flask_socketio, don't touch it.
app.config['SECRET_KEY'] = 'secret!'

cors = CORS(app)
socketio = SocketIO(app)

## Auto reload the template, so I don't have to restart
## the server every time :(
app.config['TEMPLATES_AUTO_RELOAD'] = True

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

@socketio.on("ping")
def usrp_test_connection(addr):
    return {
        "status": "fail",
        "msg": "Cannot connect to usrp server: {}".format(addr["usrp_server_addr"]) }

if __name__ == "__main__":
    socketio.run(app, debug=True)
