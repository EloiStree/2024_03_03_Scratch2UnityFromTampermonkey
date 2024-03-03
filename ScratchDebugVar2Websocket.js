// ==UserScript==
// @name         Use Scratch as controller with Websocket from HTML code.
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
    var previousDataString = ''; // Store the previous dataString

    // Function to create WebSocket connection
    function connectWebSocket() {
        // Create WebSocket connection
        socket = new WebSocket('ws://localhost:8080/echo');

        // Connection opened
        socket.addEventListener('open', function (event) {
            alert('WebSocket connection opened');
            console.log('WebSocket connected');
        });

        // Listen for messages
        socket.addEventListener('message', function (event) {
            console.log('Message from server:', event.data);
        });

        // Connection closed
        socket.addEventListener('close', function (event) {
            alert('WebSocket connection closed');
            console.log('WebSocket connection closed');
        });

        // Connection error
        socket.addEventListener('error', function (event) {
            alert('WebSocket connection error');
            console.error('WebSocket connection error:', event);
            socket.close(); // Close the WebSocket connection
        });
    }


    function checkWebSocketStatus() {
        if (!socket || socket.readyState === WebSocket.CLOSED) {
            console.log('WebSocket is not open. Reconnecting...');
            connectWebSocket();
        }
    }
    // Function to extract data and send it to WebSocket server
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

            // Append label and value to the data string
            if (label && value) {
                dataString += label + ': ' + value + '\n';
            }
        }

        // Send data to WebSocket server only if it has changed since the last time
        if (socket && socket.readyState === WebSocket.OPEN && dataString !== previousDataString) {
            socket.send(dataString);
            previousDataString = dataString; // Update previousDataString
        } else {
            //console.warn('WebSocket connection is not open or data has not changed. Data not sent.');
        }
        console.timeEnd('extractAndSendData'); // End the timer and display the elapsed time

    }

    // Call the function to create WebSocket connection
    connectWebSocket();

    // Call the extractAndSendData function initially
    extractAndSendData();

    // Invoke the extractAndSendData function every second
    setInterval(extractAndSendData, 15);
    setInterval(checkWebSocketStatus, 2000);
})();
