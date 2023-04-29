package project5;

public class Connect4WinChecker {
    
    private static final int WIN_COUNT = 4;

    private final int[][] gameBoard;
    private Connect4MoveMessage msg;
    private boolean winStatus;

    private static final boolean DEBUG = false;

    
    public Connect4WinChecker(int[][] gameBoard){
        this.gameBoard = gameBoard;
        this.winStatus = false;
    }

    public boolean hasWon(){
        return winStatus;
    }

    public void check(Connect4MoveMessage msg){
        this.msg  = msg;
        winStatus = checkVertical()
                ||  checkHorizontal()
                ||  checkDiagonalLT2LB()
                ||  checkDiagonalLB2RT();
    }

    private boolean checkVertical(){
        int count = 0;
        int col   = msg.getColumn();
   
        for (int row = msg.getRow(); row < Connect4Model.ROWS; row++){
            if (gameBoard[row][col] == msg.getColor()){
                count++;
            }else{
                count = 0;
            }

            if (count == WIN_COUNT){
                return true;
            }
        }
        if (DEBUG){
            System.out.println("checkVertical " + count);
        }
        return false;
    }

    private boolean checkHorizontal(){
        int count = 0;
        int row = msg.getRow();

        for (int col = 0; col < Connect4Model.COLS; col++){
            if (gameBoard[row][col] == msg.getColor()){
                count++;
            }else{
                count = 0;
            }

            if (count == WIN_COUNT){
                return true;
            }
        }
        if (DEBUG){
            System.out.println("checkHorizontal " + count);
        }
        return false;
    }

    private boolean checkDiagonalLT2LB(){
        int count;
        if (gameBoard[msg.getRow()][msg.getColumn()] == msg.getColor()){
            count = 1;
        }else{
            count = 0;
        }

        int curRow = msg.getRow() - 1;
        int curCol = msg.getColumn() - 1;
        // left top diagonal
        while (curRow >= 0 && curCol >= 0){
            if (gameBoard[curRow][curCol] == msg.getColor()){
                count ++;
            }else{
                break;
            }
            curRow --;
            curCol --;
        }
        // right bottom diagonal
        curRow = msg.getRow() + 1;
        curCol = msg.getColumn() + 1;
        while (curRow < Connect4Model.ROWS && curCol < Connect4Model.COLS){
            if (gameBoard[curRow][curCol] == msg.getColor()){
                count ++;
            }else{
                break;
            }
            curRow ++;
            curCol ++;
        }
        if (DEBUG){
            System.out.println("checkDiagonalLT2LB " + count +", row = " + msg.getRow() + " , col = " + msg.getColumn());
        }
        return count >= WIN_COUNT;
    }

    private boolean checkDiagonalLB2RT(){
        int count;
        if (gameBoard[msg.getRow()][msg.getColumn()] == msg.getColor()){
            System.out.println("Color = " + gameBoard[msg.getRow()][msg.getColumn()]);
            count = 1;
        }else{
            count = 0;
        }
        int curRow = msg.getRow() + 1;
        int curCol = msg.getColumn() - 1;
        // left bottom diagonal
        while (curRow < Connect4Model.ROWS && curCol >= 0){
            if (gameBoard[curRow][curCol] == msg.getColor()){
                count ++;
            }else{
                break;
            }
            curRow ++;
            curCol --;
        }
        // right top diagonal
        curRow = msg.getRow() - 1;
        curCol = msg.getColumn() + 1;
        while (curRow >= 0 && curCol < Connect4Model.COLS){
            if (gameBoard[curRow][curCol] == msg.getColor()){
                count ++;
            }else{
                break;
            }
            curRow --;
            curCol ++;
        }
        if (DEBUG){
            System.out.println("checkDiagonalLB2RT " + count +", row = " + msg.getRow() + " , col = " + msg.getColumn());
        }
        return count >= WIN_COUNT;
    } 
}
