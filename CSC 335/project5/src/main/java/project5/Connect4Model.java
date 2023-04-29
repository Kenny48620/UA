package project5;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.util.Arrays;


// TODO: Computer AI part 

public class Connect4Model{

    private PropertyChangeSupport pcs;
    private int[][] board;
    private int color;
   
    private int preRow;
    private int preCol;

    protected static final int ROWS = 6;
    protected static final int COLS = 7;

    protected static final int EMPTY  = 0; 
    protected static final int YELLOW = 1; // first player's color
    protected static final int RED    = 2; 

    protected static final int WIN_COUNT = 4;
   

    public Connect4Model(){
        board = new int[ROWS][COLS];
        color = EMPTY;
        pcs   = new  PropertyChangeSupport(this);

        preRow = -1;
        preCol = -1;
    }

    public void addObserver(PropertyChangeListener view) {
        // add the listener and set the property name
        pcs.addPropertyChangeListener("viewChanged", view);
	}
    
    public void drop(int col){
        int row;
        for (row=ROWS-1; row>=0; row--){
            if (board[row][col] == EMPTY){
                board[row][col] = color;
                break;
            }
        }
        preRow = row;
        preCol = col;
        
        Connect4MoveMessage moveMsg = new Connect4MoveMessage(row, col, color);
        // set it to null to let it fire any time the drop() is called
        pcs.firePropertyChange("viewChanged", null, moveMsg);
    }

    public void drop(Connect4MoveMessage response){

        board[response.getRow()][response.getColumn()] = response.getColor();
        preRow = response.getRow();
        preCol = response.getColumn();
        
        // set it to null to let it fire any time the drop() is called
        pcs.firePropertyChange("viewChanged", null, response);
    }

    public void setColor(int color){
        this.color = color;
    }

    public int getColor() {
        return color;
    }

    public boolean isFull(int col){
        return board[0][col] != EMPTY;
    }

    public int[][] getBoard(){
        return board;
    }

    public int getPreRow() {
        return preRow;
    }

    public int getPreCol() {
        return preCol;
    }

    public void displayBoard(){
        for (int i=0; i<ROWS; i++){
            System.out.println(Arrays.toString(board[i]));
        }
    }
}
