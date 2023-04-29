package project5;

import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.RadioButton;
import javafx.scene.control.TextField;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.stage.Modality;
import javafx.stage.Stage;

public class DialogStage extends Stage{
    
    private static final int PAD           = 20;
    private static final int WINDOW_WIDTH  = 450;
    private static final int WINDOW_HEIGHT = 200;
    private static final int SPACE         = 10;
    private static final int VERTICAL_GAP  = 20;

    private static final int SERVER    = 0;
    private static final int CLIENT    = 1;
    private static final int HUMAN     = 0;
    private static final int CCOMPUTER = 1;

    private static final String DEFAULT_IP    = "localhost";
    private static final String DEFAULT_PORT  = "4000";

    private GridPane root;
    private int createAs;
    private int playAs;
    private String  ipAddress;
    private String  portNumber;
    private boolean okToStart;


    public DialogStage(String title){
        setTitle(title);

        // Create a root node for the scene
        root = new GridPane();
        root.setVgap(VERTICAL_GAP);
        root.setPadding(new Insets(PAD));

        // initialize the setting
        initSetting();

        // Create a scene with the root node
        Scene scene = new Scene(root, WINDOW_WIDTH, WINDOW_HEIGHT);
        setScene(scene);

        // Configure the stage as a modal dialog
        initModality(Modality.APPLICATION_MODAL);
    }
    private void initSetting(){
        setFristRow();
        setSecondRow();
        setThirdRow();
        setFourthRow();
    }
    private void setFristRow(){
        // create a row
        HBox row = new HBox();
        // set the spacing
        row.setSpacing(SPACE);

        // create the nodes in the row
        Label     createLb   = new Label("Create:");
        RadioButton serverRb = new RadioButton("Server");
        RadioButton clientRb = new RadioButton("Client");
        ToggleGroup group    = new ToggleGroup();

        // set to the same group
        serverRb.setToggleGroup(group);
        clientRb.setToggleGroup(group);

        // default 
        serverRb.setSelected(true);
        createAs = SERVER;


        // add event handler to update isServerSelected
        serverRb.setOnAction(event -> createAs = SERVER);
        clientRb.setOnAction(event -> createAs = CLIENT);

        
        // add nodes to the row
        row.getChildren().addAll(createLb, serverRb, clientRb);
        
        // add to the first row
        root.add(row, 0, 0);    
    }

    private void setSecondRow(){
        // create a row
        HBox row = new HBox();
        // set the spacing
        row.setSpacing(SPACE);

        // create the nodes in the row
        Label playAsLb         = new Label("Play as:");
        RadioButton humanRb    = new RadioButton("Human");
        RadioButton computerRb = new RadioButton("Computer");
        ToggleGroup group      = new ToggleGroup();

        // set to the same group
        humanRb.setToggleGroup(group);
        computerRb.setToggleGroup(group);

        // default
        humanRb.setSelected(true);
        playAs = HUMAN;

        // add event handler to update isHumanSelected
        humanRb.setOnAction(event -> playAs = HUMAN);
        computerRb.setOnAction(event -> playAs = CCOMPUTER);

        // add nodes to the row
        row.getChildren().addAll(playAsLb, humanRb, computerRb);
        
        // add to the second row
        root.add(row, 0, 1);  
    }

    private void setThirdRow(){
        // create a row
        HBox row = new HBox();
        // set the spacing
        row.setSpacing(SPACE);

        // create server, port labels and the ip, ports text field
        Label serverLb = new Label("Server");
        Label portLb   = new Label("Port");
        TextField ip   = new TextField(DEFAULT_IP);
        TextField port = new TextField(DEFAULT_PORT);

        // add the nodes to the row
        row.getChildren().addAll(serverLb, ip, portLb, port);

        
        // set default server and port
        ipAddress  = DEFAULT_IP;
        portNumber = DEFAULT_PORT;
          

        // add event handler to update ipAddress
        ip.setOnKeyReleased(event -> {
            ipAddress = ip.getText();
        //    System.out.println("ipAddress : " + ipAddress);
        });
        port.setOnKeyReleased(event ->{
            portNumber = port.getText();
        //    System.out.println("portNumber : " + portNumber);
        });


        // add to the third row
        root.add(row, 0, 2);  
    }

    private void setFourthRow(){
        // create a row
        HBox row = new HBox();
        row.setSpacing(SPACE);

        Button okBtn     = new Button("OK");
        Button cancelBtn = new Button("Cancel");

        // add the nodes to the row
        row.getChildren().addAll(okBtn, cancelBtn);

        // add to the third row
        root.add(row, 0, 3);  

        // set default
        okToStart = false;

        // addtional setting
        okBtn.setOnAction(event->{
            okToStart = true;
            this.close();
        });
        cancelBtn.setOnAction(event->close());
    }

    public int getCreateAs()     { return createAs; }
    public int getplayAs()       { return playAs; }
    public String getAddress()   { return ipAddress; }
    public int    getPort()      { return Integer.valueOf(portNumber); }
    public boolean isOkToStart() { return okToStart; }
}
