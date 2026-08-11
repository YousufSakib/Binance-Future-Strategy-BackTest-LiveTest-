function ping({ event }) {
    console.log(event);
}

setTimeout(ping, 1000, { event: "message" })