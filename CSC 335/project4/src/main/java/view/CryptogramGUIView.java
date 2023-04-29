package view;

import java.util.HashMap;
import java.util.Observable;
import java.util.Observer;

import controller.CryptogramController;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import model.CryptogramModel;

/**
 * This is the gui class of Cryptogram. Unfortunately, the type Observer is deprecated since version 9.
 */
public class CryptogramGUIView extends Application implements Observer{
    private CryptogramModel      model;      // model
    private CryptogramController controller; // controller

    private BorderPane root;        // root of entrie GUI
    private GridPane   grid;        // text grid

    private VBox      menu;         // right part menu
    private Button    newPuzzleBtn; // new puzzle button
    private Button    hintBtn;      // hint button
    private CheckBox  freqBox;      // frequence button
    private GridPane  freqArea;     // a area that shoing the frequence

    private static final int WINDOW_WIDTH  = 1000;   // the width of the window, default = 900 I set 1000 to make 
                                                     // it looks better
    private static final int WINDOW_HEIGHT = 400;    // the height of the window
    private static final int LINE_MAX      = 30;     // maximum characters in a line
    private static final int TEXT_MAX      = 1;      // maximum characters in a text input field

    private static final int START_LETTER_NUM  = 65; // start from A
    private static final int FRE_COL    = 13;        // maximum number of cols in freqArea
    private static final int FRE_ROW    = 2;         // maximum number of rows in freqArea

    private static final String WINNER_MESSAGE = "You won!"; // a message to show the winner
    @Override
    public void start(Stage stage) throws Exception {   
        model = new CryptogramModel();
        // subscribe the GUI View
        model.addObserver(this);
        controller = new CryptogramController(model);

        stage.setTitle("Cryptogram");
        root = new BorderPane();

        updateMenu();
        updateTextGrid();

        // show the GUI
        Scene scene = new Scene(root, WINDOW_WIDTH, WINDOW_HEIGHT);
        stage.setScene(scene);
        stage.show();
    }

    /**
     * Update text grid
     */
    private void updateTextGrid(){
        String[]    encryptedPieces = controller.getEncryptedQuote().split(" ");
        StringBuilder currentProgress = new StringBuilder();

        grid = new GridPane();
        int col = 0;
        int row = 0;
        // build up text grid areas
        for (int i=0; i<encryptedPieces.length; i++){
            if (currentProgress.length() + encryptedPieces[i].length() > LINE_MAX){
                for (int j=0; j<currentProgress.length(); j++){
                    String s = currentProgress.substring(j, j+1);
                    VBox vb = createVBox(s);
                    grid.add(vb, col, row);
                    col++;
                }
                col = 0;
                row++;
                currentProgress = new StringBuilder();
            }
            if (currentProgress.length() + 1 < LINE_MAX){
                currentProgress.append(encryptedPieces[i]+" ");
            }
        }

        for (int j=0; j<currentProgress.length(); j++){
            String s = currentProgress.substring(j, j+1);

            // set textfield
            VBox vb = createVBox(s);
            grid.add(vb, col, row);
            col++;
        }

        root.setCenter(grid);
    }

    /**
     * Creat a VBox with it's contents
     * @param s label content
     * @return  a VBox
     */
    private VBox createVBox(String s){
        
        // set textfield
        TextField tf = new TextField();
        tf.setPrefColumnCount(1);
        tf.setAlignment(Pos.CENTER);
        tf.requestFocus();

        // set label
        Label lb = new Label(s);

        // set vbox
        VBox  vb = new VBox();
        vb.getChildren().add(tf);
        vb.getChildren().add(lb);
        vb.setAlignment(Pos.CENTER);


        if (s.equals(" ")){
            vb.setVisible(false);
            return vb;
        }else if (!s.matches("[A-Z]+")){
            tf.setText(s);
            tf.setDisable(true);
            return vb;
        }
        
        HashMap<Character, Character> guessMap = controller.getGuessMap();
        Character  guessLetter = guessMap.get(s.charAt(0));
        tf.setText(guessLetter.toString());
        
        HashMap<Character, Character> answerMap = controller.getAnswerMap();
        // guessMap  (encry,  guess)
        // answerMap (answer, encry)
        // check if the guess is matched with the correct answer
        if (answerMap.containsKey(guessLetter) && answerMap.get(guessLetter) == lb.getText().charAt(0)){
            tf.setDisable(true);
        }
    
        textHandler(tf, lb);
        return vb;
    }

    /**
     * Update the menu
     */
    public void updateMenu(){
        menu         = new VBox();
        freqArea     = new GridPane();
        newPuzzleBtn = getNewPuzzleBtn();
        hintBtn      = getHintBtn();
        freqBox      = getfreqBox();

        menu.setPadding(new Insets(0, 5, 0, 0));
        
        menu.getChildren().add(newPuzzleBtn);
        menu.getChildren().add(hintBtn);
        menu.getChildren().add(freqBox);
        menu.getChildren().add(freqArea);

        freqArea.setVisible(false);
        freqBox.setPadding(new Insets(5, 0, 0, 0));
        
        root.setRight(menu);
    }

    /**
     * 
     * A handler that handle the input text fields
     * @param text
     */
    private void textHandler(TextField text, Label label){ 

        // make the input text field that only can have one letter
        text.textProperty().addListener((observable, oldValue, newValue) -> {
            text.setText(newValue.toUpperCase());
            if (text.getText().length() > TEXT_MAX) {
                String copy = text.getText().substring(1, TEXT_MAX+1);
                text.setText(copy);
            }
        });
     
        // set the replacement once the input is catched 
        text.setOnKeyReleased((e) -> {
            Character above;
            if (text.getText().length() == 0){
                above = '\0';
            }else{
                above = text.getText().toUpperCase().charAt(0);
            }
            Character below = label.getText().charAt(0);
            controller.makeReplacement(below, above);
        });
    }

    /**
     * Return a newPuzzle button
     * @return a button
     */
    private Button getNewPuzzleBtn(){
        Button btn = new Button("New Puzzle");

        // create a new puzzle
        btn.setOnMouseClicked((e)->{
            model       = new CryptogramModel();
            model.addObserver(this); // subscribe the GUIView
            controller = new CryptogramController(model);
            updateTextGrid();
            updateMenu();
        });

        return btn;
    }

    /**
     * Return a hint button
     * @return a button
     */
    private Button getHintBtn(){
        Button btn = new Button("Hint");
        // automatically fufill one slot for the player 
        btn.setOnMouseClicked((e)->{
            String[] hints = controller.getHintArray();
            Character below = hints[1].charAt(0);
            Character above = hints[3].charAt(0);
            controller.makeReplacement(below, above);
        });

        return btn;
    }

    /**
     * Reaturn a freqBox
     * @return a CheckBox
     */
    private CheckBox getfreqBox(){
        CheckBox box = new CheckBox("Show Freq");
        // update the frquence of characters to freqArea
        updateFreqArea();
        // if the checkBox is sellected, show the freqArea. Hide it, otherwise.
        box.setOnAction((e)->{
            if (box.isSelected()){
                freqArea.setVisible(true);

            }else{
                freqArea.setVisible(false);
            }
        });

        return box;
    }

    /**
     * update the frquence of characters to freqArea
     */
    private void updateFreqArea(){
        HashMap<Character, Integer> freqMap = controller.getFreqMap();
        int letterCode = START_LETTER_NUM;
        String pad     = "  ";

        for (int row=0; row<FRE_ROW; row++){
            if (row == 1){
                pad = " ";
            }
            for (int col=0; col<FRE_COL; col++){
                String letter = Character.toString((char) letterCode);
                String each = letter + pad + freqMap.get((char)letterCode);
                freqArea.add(new Label(each), row, col);
                letterCode++;
            }
        }

        ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(60);
        freqArea.getColumnConstraints().addAll(col1);
    }

    /**
     * Pop up an alert window to show the palyer winning message
     */
    private void popUpWindow(){
        Alert a = new Alert(AlertType.INFORMATION);
        a.setContentText(WINNER_MESSAGE);
        a.showAndWait();
    }

    // keep updating the view if model is changed 
    @Override
    public void update(Observable o, Object arg) {
       // update the text grids
       updateTextGrid();
       // check if the player is won
       if (controller.isGameOver()){
         popUpWindow();
       }
    }
    
}