package project5;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;


import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Menu;
import javafx.scene.control.MenuBar;
import javafx.scene.control.MenuItem;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

/**
 * TODO: improve AI parts
 */
public class Connect4View extends Application implements PropertyChangeListener{

    private Connect4Model      model;
    private Connect4Controller controller;


    private BorderPane mainPane;
    private GridPane palyGround;
    private VBox     menuArea;
    private DialogStage dialog;

    private int     createAs;
    private int     playAs;
    private Connect4MoveMessage moveMsg;

    
    private static final String VIEW_TITLE   = "Connect 4";
    private static final String DIALOG_TITLE = "Network Setup";
    private static final double PLAYGROUND_WIDTH  = 344;
    private static final double PLAYGROUND_HEIGHT = 296;
    private static final double MENUAREA_HEIGHT   = 30;


    private static final int GAP = 8;
    private static final int CIRCLE_RADIUS = 20;
    private static final String WINNER_MESSAGE   = "You won!"; // a message to show the winner
    private static final String ERROR_MESSAGE    = "Column full, pick somewhere else!"; // a message to show the winner
    private static final String REMINDER_MESSAGE = "Please start a new game"; // a message to show the winner
    protected static final String LOSER_MESSAGE  = "You lose!"; // a message to show the loser


    private static final String MENU_NAME = "File";
    private static final String MENU_ITEM = "New Game";

    private static final int SERVER   = 0;
    private static final int CLIENT   = 1;
    private static final int HUMAN    = 0;
    private static final int COMPUTER = 1;

    @Override
    public void start(Stage stage) throws Exception {
        // set model
        model = new Connect4Model();
        model.addObserver(this);

        // set controller
        controller = new Connect4Controller(model, this);

        // set menu area
        menuArea    = new VBox();
        setMenuAreaAndNewGameSetting();

        // set playground
        palyGround = new GridPane();
        setPlayGround();
        paintTokens();

        // set main pane
        mainPane = new BorderPane();
        mainPane.setTop(menuArea);
        mainPane.setCenter(palyGround);

        // set stage
        Scene scene = new Scene(mainPane, PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT+MENUAREA_HEIGHT);
        stage.setTitle(VIEW_TITLE);
        stage.setScene(scene);
        stage.show();
    }

    // update the token in a specific location
    @Override
    public void propertyChange(PropertyChangeEvent evt) {
        // thorwing exception  ??
        moveMsg = (Connect4MoveMessage) evt.getNewValue();
        paintTokenByLoc(moveMsg);

        // every time propert change notify to start 
        if (playAs == COMPUTER){
            // check the movement 
            controller.checkMovement(moveMsg);
            if (controller.isGameOver()){
                popUpWindow(WINNER_MESSAGE);
            } 
            controller.computerTurn();
            controller.sendMoveMessage(moveMsg); 
        }
    }

    private void setPlayGround(){
        BackgroundFill colorFill  = new BackgroundFill(Color.BLUE, null, null);
        Background     background = new Background(colorFill);
        palyGround.setBackground(background);
        palyGround.setHgap(GAP);
		palyGround.setVgap(GAP);
		palyGround.setPadding(new Insets(GAP));

        palyGround.setOnMouseClicked(event -> {
            if (controller.isMyTurn() && playAs == HUMAN){
                double x = event.getX();
                int col  = (int) (x/(PLAYGROUND_WIDTH/Connect4Model.COLS));
                if (controller.colIsFull(col)){
                    popUpWindow(ERROR_MESSAGE);
                }else{
                    // drop token in own view
                    controller.humanTurn(col);

                    // send the msg to another side
                    controller.sendMoveMessage(moveMsg);  
                    controller.switchTurn();


                    // check the movement 
                    controller.checkMovement(moveMsg);
                    if (controller.isGameOver()){
                        popUpWindow(WINNER_MESSAGE);
                    } 
                }
            }
        });
    }

    private void paintTokens(){
        for (int row=0; row<Connect4Model.ROWS; row++){
            for (int col=0; col<Connect4Model.COLS; col++){
                Circle circle = new Circle(CIRCLE_RADIUS, Color.WHITE);
                palyGround.add(circle, col, row);
            }
        }
    }

    private void paintTokenByLoc(Connect4MoveMessage msg){
        Circle circle = new Circle(CIRCLE_RADIUS);
        if (msg.getColor() == Connect4Model.YELLOW){
            circle.setFill(Color.YELLOW);
        }else{
            circle.setFill(Color.RED);
        }
        palyGround.add(circle, msg.getColumn(), msg.getRow());
    }

  
    public void popUpWindow(String msg){

        Alert alert = new Alert(AlertType.NONE);
        if (msg == WINNER_MESSAGE || msg == LOSER_MESSAGE || msg == REMINDER_MESSAGE){
            alert.setAlertType(AlertType.INFORMATION);
        }else if (msg == ERROR_MESSAGE){
            alert.setAlertType(AlertType.ERROR);
        }
        
        alert.setContentText(msg);
        alert.showAndWait();
    }

    private void setMenuAreaAndNewGameSetting(){
        // create menu item
        MenuItem item   = new MenuItem(MENU_ITEM);
        item.setOnAction((e)->{
            dialog = new DialogStage(DIALOG_TITLE);
            dialog.showAndWait();

            if (dialog.isOkToStart()){
                createAs = dialog.getCreateAs();
                playAs   = dialog.getplayAs();
                // update the playground
                paintTokens();

                if (createAs == SERVER){
                    controller.switchTurn();
                    controller.setColor(Connect4Model.YELLOW);
                    controller.setServer(dialog.getPort());
                    controller.startServer();

                    // if play as computer, start the first turn
                    if (playAs == COMPUTER){
                        controller.computerTurn();
                    }
                }else if (createAs == CLIENT){
                    controller.setColor(Connect4Model.RED);
                    controller.setClient(dialog.getAddress(), dialog.getPort());
                    controller.startConnection();
                }
            }
        });
     
        // create menu
        Menu     menu   = new Menu(MENU_NAME);
        // add menu item
        menu.getItems().add(item);
        // create menu bar
        MenuBar menuBar = new MenuBar();
        // add menu to menu bar
        menuBar.getMenus().add(menu);
        // add menu bar to menu area
        menuArea.getChildren().add(menuBar);
    }

    public static void main(String[] args) {
        launch(args);
    }

}
