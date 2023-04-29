package project5;

public class Connect4Controller {

    private Connect4Model      model;
    private Connect4View       view;
    private Connect4WinChecker winChecker;

    private Connect4Server     server;
    private Connect4Client     client;
    private boolean myTurn;

    public Connect4Controller(Connect4Model model, Connect4View view){
        this.model      = model;
        this.view       = view;
        this.winChecker = new Connect4WinChecker(this.model.getBoard());
    }

    public void checkMovement(Connect4MoveMessage response){
        winChecker.check(response);
    }

    public boolean isGameOver(){
        return winChecker.hasWon();
    }

    public boolean colIsFull(int col){
        return model.isFull(col);
    }
    public void humanTurn(int col){
        model.drop(col);
    }

    public void player2Turn(Connect4MoveMessage response){
        model.drop(response);

        // check if another player has won the game
        checkMovement(response);

        // isGameOver() is not work for another color
        if (isGameOver()){
            // pop up a window to notify the player is lose
            view.popUpWindow(Connect4View.LOSER_MESSAGE);
            System.out.print("Game is over oppsite won!");
        }else{
            switchTurn();
        }
    }

    public void setComputer(){

    }

    // it works but didn't notify another
    public void computerTurn(){
        int[][] board = model.getBoard();
        for (int row=0; row<Connect4Model.ROWS; row++){
            for (int col=0; col<Connect4Model.COLS; col++){
                if (board[row][col] == Connect4Model.EMPTY){
                    model.drop(col);
                    break;
                }
            }
        }

    }




    public void setServer(int port){
        server = new Connect4Server(port);
    }

    public void setClient(String address, int port){
        client = new Connect4Client(address, port);
    }

    public void startServer(){
        server.startServer();
        Thread thread = new Thread(server.new WaitForResponse(this));
//System.out.println("Start running wait for response for new thread");
        thread.start();
    //   System.out.println("thread.start() is called!");
    }

    public void startConnection(){
        client.startConnection();
        Thread thread = new Thread(client.new WaitForResponse(this));
  //      System.out.println("Start running wait for response for new thread");
        thread.start();
  //      System.out.println("thread.start() is called!");
    }

    public void sendMoveMessage(Connect4MoveMessage message){
        if (server != null){
            server.sendMoveMessage(message);
        }else if (client != null){
            client.sendMoveMessage(message);
        }
    }

    public Connect4MoveMessage getResponse(){
        
        if (server != null){
            return server.getResponseMoveMessage();
        }else if (client != null){
            return client.getResponseMoveMessage();
        }

        return null;
    }

    public boolean isMyTurn(){
        return myTurn;
    }

    public void setMyTurn(boolean turn){
        myTurn = turn;
    }

    public void switchTurn(){
        if (myTurn == true){
            myTurn = false;
        }else{
            myTurn = true;
        }
    }

    public void setColor(int color){
        model.setColor(color);
    }

    public int getColor(){
        return model.getColor();
    }  
}
