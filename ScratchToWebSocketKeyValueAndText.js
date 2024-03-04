// ==UserScript==
// @name         Main Use Scratch as controller with Websocket from HTML code.
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extract data from webpage when right-clicked
// @author       Éloi Strée
// @match        https://scratch.mit.edu/projects/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var socket = null; // Initialize WebSocket variable
    var previousData = {}; // Store the previous data
    var useFullText = true;
    var useKeyValue = true;

    // Function to create WebSocket connection
    function connectWebSocket() {
        // Create WebSocket connection
        socket = new WebSocket('ws://localhost:8080/tamperinput');

        // WebSocket events
        socket.addEventListener('open', function (event) {
            console.log('WebSocket connected');
        });

        socket.addEventListener('message', function (event) {
            console.log('Message from server:', event.data);
        });

        socket.addEventListener('close', function (event) {
            console.log('WebSocket connection closed');
            // Reconnect if connection closed unexpectedly
            connectWebSocket();
        });

        socket.addEventListener('error', function (event) {
            console.error('WebSocket connection error:', event);
        });
    }

    // Check WebSocket status and reconnect if necessary
    function checkWebSocketStatus() {
        if (!socket || socket.readyState === WebSocket.CLOSED) {
            console.log('WebSocket is not open. Reconnecting...');
            connectWebSocket();
        }
    }
    function sendText(data) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(data);
        }
    }
    // Send data to WebSocket server
    function sendData(label, value) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(label + ":" + value);
        }
    }

    // Extract data and send it to WebSocket server
    function extractAndSendData() {
        console.time('extractAndSendData'); // Start the timer
        var dataString = ''; // Initialize empty string to store data

        // Find all elements with class 'react-contextmenu-wrapper'
        var elements = document.getElementsByClassName('react-contextmenu-wrapper');

        // Iterate through each element
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

            // Find elements with classes 'monitor_label_ci1ok' and 'monitor_value_3Yexa' within current element
            var labelElement = element.querySelector('.monitor_label_ci1ok');
            var valueElement = element.querySelector('.monitor_value_3Yexa');

            // Extract text content from label and value elements
            var label = labelElement ? labelElement.textContent.trim() : '';
            var value = valueElement ? valueElement.textContent.trim() : '';

            if (label && value) {
                dataString += label + ': ' + value + '\n';
                if (useKeyValue) {
                    if (!previousData[label]) {
                        previousData[label] = value;
                        sendData(label, value);
                    } else {
                        if (previousData[label] !== value) {
                            previousData[label] = value;
                            sendData(label, value);
                        }
                    }
                }
            }
        }
        if (useFullText && previousData.fullText !== dataString) {
            previousData.fullText = dataString;
            sendText("<FullData>"+ dataString + "</FullData>");
        }
        console.timeEnd('extractAndSendData'); // End the timer and display the elapsed time
    }

    // Call the function to create WebSocket connection
    connectWebSocket();

    // Call the extractAndSendData function initially
    extractAndSendData();

    // Invoke the extractAndSendData function every 15 milliseconds
    setInterval(extractAndSendData, 15);

    // Check WebSocket status every 2 seconds
    setInterval(checkWebSocketStatus, 2000);
})();
