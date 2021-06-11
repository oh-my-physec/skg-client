const socket = io();

socket.on("connect", () => {
    console.log("websocket connect, with socket.id='" + socket.id + "'");
});

function alert_info(msg) {
    // Delay the alert, since the DOM updates are asynchronous.
    // See: https://macarthur.me/posts/when-dom-updates-appear-to-be-asynchronous
    setTimeout(() => {
	alert("[INFO] " + msg);
    }, 20);
}

function alert_error(msg) {
    setTimeout(() => {
	alert("[ERROR] " + msg);
    }, 20);
}

function get_element_value_or(ele_id, fallback) {
    const ele = document.getElementById(ele_id);
    if (!ele || !ele.value || !ele.value.trim()) {
	return fallback;
    }
    return ele.value.trim();
}

// These fields should be consistent with definitions in
// https://github.com/oh-my-physec/usrp-server/blob/69722b78e6755f5ec8222a22d6e778b0ae7802b7/src/usrp.cc#L130
const usrp_server_config_name_mapping = {
    "rx_antenna": {
	setter: (val) => {
	    const rx_antenna_form = document.getElementById("usrp-rx-antenna-form");
	    if (val == "TX/RX") {
		rx_antenna_form.value = "txrx";
	    } else if (val == "RX2") {
		rx_antenna_form.value = "rx2";
	    }
	},
	getter: () => {
	    const val = get_element_value_or("usrp-rx-antenna-form", "")
	    if (val == "txrx") {
		return "TX/RX";
	    } else if (val == "rx2") {
		return "RX2";
	    }
	    return "";
	},
    },
    "rx_bandwidth": {
	setter: (val) => {
	    const rx_bandwidth_form = document.getElementById("usrp-rx-bandwidth-form");
	    rx_bandwidth_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-rx-bandwidth-form", "");
	},
    },
    "rx_freq": {
	setter: (val) => {
	    const rx_freq_form = document.getElementById("usrp-rx-freq-form");
	    rx_freq_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-rx-freq-form", "");
	},
    },
    "rx_gain": {
	setter: (val) => {
	    const rx_gain_form = document.getElementById("usrp-rx-gain-form");
	    rx_gain_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-rx-gain-form", "");
	},
    },
    "rx_rate": {
	setter: (val) => {
	    const rx_rate_form = document.getElementById("usrp-rx-rate-form");
	    rx_rate_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-rx-rate-form", "");
	},
    },
    "rx_sample_per_buffer": {
	setter: (val) => {
	    const rx_sample_per_buffer_form = document.getElementById("usrp-rx-sample-per-buffer-form");
	    rx_sample_per_buffer_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-rx-sample-per-buffer-form", "");
	},
    },
    "rx_maximum_samples": {
	setter: (val) => {
	    const rx_maximum_samples_form = document.getElementById("usrp-rx-maximum-samples-form");
	    rx_maximum_samples_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-rx-maximum-samples-form", "");
	},
    },
    "tx_antenna": {
	setter: (val) => {
	    const tx_antenna_form = document.getElementById("usrp-tx-antenna-form");
	    if (val == "TX/RX") {
		tx_antenna_form.value = "txrx";
	    }
	},
	getter: () => {
	    const tx_antenna = get_element_value_or("usrp-tx-antenna-form", "");
	    if (tx_antenna == "txrx") {
		return "TX/RX";
	    }
	},
    },
    "tx_bandwidth": {
	setter: (val) => {
	    const tx_bandwidth_form = document.getElementById("usrp-tx-bandwidth-form");
	    tx_bandwidth_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-tx-bandwidth-form", "");
	},
    },
    "tx_freq": {
	setter: (val) => {
	    const tx_freq_form = document.getElementById("usrp-tx-freq-form");
	    tx_freq_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-tx-freq-form", "");
	},
    },
    "tx_gain": {
	setter: (val) => {
	    const tx_gain_form = document.getElementById("usrp-tx-gain-form");
	    tx_gain_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-tx-gain-form", "");
	},
    },
    "tx_rate": {
	setter: (val) => {
	    const tx_rate_form = document.getElementById("usrp-tx-rate-form");
	    tx_rate_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-tx-rate-form", "");
	},
    },
    "tx_sample_per_buffer": {
	setter: (val) => {
	    const tx_sample_per_buffer_form = document.getElementById("usrp-tx-sample-per-buffer-form");
	    tx_sample_per_buffer_form.value = val;
	},
	getter: () => {
	    return get_element_value_or("usrp-tx-sample-per-buffer-form", "");
	},
    },
    "tx_prefix_wave": {
	setter: (val) => {
	    values = val.split(",");
	    const tx_prefix_sine_length_form = document.getElementById("usrp-tx-prefix-sine-length-form");
	    tx_prefix_sine_length_form.value = values[1];
	    const tx_prefix_sine_periods_form = document.getElementById("usrp-tx-prefix-sine-periods-form");
	    tx_prefix_sine_periods_form.value = values[3];
	},
	getter: () => {
	    const tx_prefix_sine_length = get_element_value_or("usrp-tx-prefix-sine-length-form", "100");
	    const tx_prefix_sine_periods = get_element_value_or("usrp-tx-prefix-sine-periods-form", "20");
	    return `1,${tx_prefix_sine_length},SINE,${tx_prefix_sine_periods}`;
	},
    },
};

function skg_usrp_server_test_connection() {
    if (!socket.connected) {
	alert_error("socket.io is not connected");
    }

    const addr = get_element_value_or("usrp-server-addr-form", "");
    if (addr == "") {
	alert_error("Please specify 'USRP Server Address'");
	return;
    }

    socket.emit("usrp_server_ping", { usrp_server_addr: "tcp://" + addr }, (resp) => {
	if (resp.status != "ok") {
	    alert_error(resp.explain);
	} else {
	    alert_info("USRP Server is alive");
	}
    });
}

function skg_load_config() {
    const addr = get_element_value_or("usrp-server-addr-form", "");
    if (addr == "") {
	alert_error("Please specify 'USRP Server Address'");
	return;
    }

    socket.emit("usrp_server_load_config", {
	usrp_server_addr: "tcp://" + addr,
	usrp_server_config_fields: Object.keys(usrp_server_config_name_mapping),
    }, (resp) => {
	if (resp.status != "ok") {
	    alert_error(resp.explain);
	} else {
	    for (let kv in resp.payload) {
		usrp_server_config_name_mapping[kv].setter(resp.payload[kv]);
	    }
	    alert_info("Config is loaded");
	}
    });
}

function skg_update_config() {
    const addr = get_element_value_or("usrp-server-addr-form", "");
    if (addr == "") {
	alert_error("Please specify 'USRP Server Address'");
	return;
    }

    server_config = {}
    for (let kv in usrp_server_config_name_mapping) {
	server_config[kv] = usrp_server_config_name_mapping[kv].getter();
    }

    socket.emit("usrp_server_update_config", {
	usrp_server_addr: "tcp://" + addr,
	usrp_server_config: server_config,
    }, (resp) => {
	if (resp.status != "ok") {
	    alert_error(resp.explain);
	} else {
	    alert_info("Config is updated");
	}
    });
}

function skg_reset_config() {
    alert_info("Config is reset");
}

function skg_shutdown_all_jobs() {
    alert_info("All jobs is stopped");
}

function skg_peer_server_test_connection() {
    alert_info("Peer Server is connected");
}

function skg_skg_platform_server_test_connection() {
    alert_info("SKG Platform Server is connected");
}
