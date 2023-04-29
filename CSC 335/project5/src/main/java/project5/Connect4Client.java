package project5;

public class Connect4Client extends Connect4NetWork{
    
    public Connect4Client(String address, int port){
        super(address, port);
    }

    public void startConnection(){
        System.out.println("Start connect to " + address +" with port " + port);
        init();
    }
}