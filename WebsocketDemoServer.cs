using System;
using WebSocketSharp;
using WebSocketSharp.Server;

class Program
{
    static void Main(string[] args)
    {
        // Create a new instance of the WebSocketServer listening on port 8080
        var wssv = new WebSocketServer(8080);

        // Add the Echo websocket service
        wssv.AddWebSocketService<Echo>("/echo");

        // Start the server
        wssv.Start();

        Console.WriteLine("WebSocket server started on ws://localhost:8080/echo");
        Console.WriteLine("Press any key to stop the server...");
        Console.ReadKey();

        // Stop the server  
        wssv.Stop();
    }
}

// Define the WebSocket service for echoing messages back to the client
public class Echo : WebSocketBehavior
{
    protected override void OnMessage(MessageEventArgs e)
    {
        // Display the received message in the console
        Console.WriteLine("Received message: " + e.Data);

        // Echo the received message back to the client
        //Send(e.Data);
    }
}
