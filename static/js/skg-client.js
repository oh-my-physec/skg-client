const socket = io();

socket.on("connect", () => {
    console.log("websocket connect, with socket.id='" + socket.id + "'");
});

function alert_info(msg) {
    alert("[INFO] " + msg);
}

function alert_error(msg) {
    alert("[ERROR] " + msg);
}

function skg_test_connection() {
    if (!socket.connected) {
	alert_error("socket.io is not connected");
    }

    const addr = document.getElementById("usrp-server-addr-form");
    if (!addr.value || !addr.value.trim()) {
	alert_error("Please specify 'USRP Server Address'");
    }

    socket.emit("ping", { usrp_server_addr: addr.value.trim() }, (resp) => {
	if (resp.status != "ok") {
	    alert_error(resp.msg);
	} else {
	    alert_info("USRP Server is alive");
	}
    });
}

function skg_load_config() {
    alert_info("Config is loaded")
}

function skg_update_config() {
    alert_info("Config is updated")
}

function skg_reset_config() {
    alert_info("Config is reset")
}
