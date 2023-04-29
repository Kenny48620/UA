package project5;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.net.ServerSocket;
import java.net.Socket;

import javafx.application.Platform;

public class Connect4NetWork {
    protected String address;
    protected int    port;

    protected ServerSocket server;
    protected Socket connection;

    protected ObjectOutputStream oos; // output
    protected ObjectInputStream  ois; // input 

    protected Connect4MoveMessage response;

    public Connect4NetWork(String address, int port){
        this.address = address;
        this.port    = port;
    }

    public void init(){
        try {
            connection = createSocket();
            oos = new ObjectOutputStream(connection.getOutputStream());
            ois = new ObjectInputStream(connection.getInputStream());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private Socket createSocket() throws IOException{
        // Server side initialization
        if (address == null) {
            server = new ServerSocket(port);
            return server.accept();
        }
        // Client side initialization
        else{
            return new Socket(address, port);
        }
    }

    public void sendMoveMessage(Connect4MoveMessage message){
        try {
            oos.writeObject(message);
            oos.flush();
            System.out.println("msg send -> " + message);
        } catch (IOException e) {
            e.printStackTrace();
        }
    } 

    public Connect4MoveMessage getResponseMoveMessage(){
        return response;
    }

    public class WaitForResponse implements Runnable{
        private Connect4Controller controller;

        public WaitForResponse(Connect4Controller controller){
            this.controller = controller;
        }
        @Override
        public void run() {
            waitForResponse();
        }

        private void waitForResponse(){
            while(true){
                try {
                    response = (Connect4MoveMessage) ois.readObject();
                    System.out.println("Get response " + response);
                    // controller.player2Turn(response);
                    Platform.runLater(() -> {
                        // Code to be executed on the JavaFX Application Thread
                        // For example, updating the UI
                        Connect4MoveMessage response = controller.getResponse();
                        if (response != null){
                            controller.player2Turn(response);
                        }
                    });
                } catch (ClassNotFoundException | IOException e) {
                    e.printStackTrace();
                }
            }
        }

    }

}
