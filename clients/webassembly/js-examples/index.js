// Copyright 2020 Nym Technologies SA
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as wasm from "nym-sphinx-wasm";

class Route {
    constructor(nodes) {
        this.nodes = nodes;
    }
}

class NodeData {
    constructor(address, public_key) {
        this.address = address;
        this.public_key = public_key;
    }
}

async function main() {
    // Get the topology, then the mixnode and provider data
    const topology = await getTopology();
    const mixnodes = topology.mixNodes;
    const provider = topology.mixProviderNodes[0];

    // Construct a route so we can get wasm to build us a Sphinx packet
    let nodes = [];
    mixnodes.forEach(node => {
        let n = new NodeData(node.host, node.pubKey);
        nodes.push(n);
    });
    let p = new NodeData(provider.mixnetListener, provider.pubKey)
    nodes.push(p);
    let route = new Route(nodes);

    // Set up a websocket connection to the gateway node
    var port = "1793" // gateway websocket listens on 1793 by default, change if yours is different
    var url = "ws://127.0.0.1:" + port;

    var connection = await connectWebsocket(url).then(function (c) {
        return c
    }).catch(function (err) {
        console.log("Websocket ERROR: " + err);
    })

    // Set up the send button
    const sendButton = document.querySelector('#send-button');
    sendButton.onclick = function () {
        sendMessageToMixnet(connection, route);
    }
}

// Create a Sphinx packet and send it to the mixnet through the Gateway node. 
function sendMessageToMixnet(connection, route) {
    var recipient = document.getElementById("recipient").value;
    var sendText = document.getElementById("sendtext").value;
    let packet = wasm.create_sphinx_packet(JSON.stringify(route), sendText, recipient);
    connection.send(packet);
    display("Sent a Sphinx packet containing message: " + sendText);
    displaySend(packet);
}

async function getTopology() {
    let topologyURL = 'http://127.0.0.1:8080/api/presence/topology';
    let response = await http('get', topologyURL);
    let topology = JSON.parse(response);
    return topology;
}

// Let's get started!
main();

// utility functions below here, nothing too interesting...

function display(message) {
    document.getElementById("output").innerHTML += "<p>" + message + "</p >";
}

function displaySend(message) {
    document.getElementById("output").innerHTML += "<p style='color: blue; word-break: break-all;'>sent >>> " + message + "</p >";
}

function http(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

function connectWebsocket(url) {
    return new Promise(function (resolve, reject) {
        var server = new WebSocket(url);
        server.onopen = function () {
            resolve(server);
        };
        server.onerror = function (err) {
            reject(err);
        };

    });
}