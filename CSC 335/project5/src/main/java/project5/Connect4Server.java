package project5;

/**
 * One to one server
 */
public class Connect4Server extends Connect4NetWork{

    public Connect4Server(int port){
        super(null, port);
    }

    public void startServer(){
        System.out.println("Sever start with port "+port);
        init();
    }
}
