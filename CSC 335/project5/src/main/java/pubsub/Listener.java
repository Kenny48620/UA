package pubsub;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

public class Listener extends Application implements PropertyChangeListener{

    @Override
    public void start(Stage stage) throws Exception {
        Subject s = new Subject("AVC");
        s.addObserver(this);



        stage.setTitle("TITLE");
        Scene scene = new Scene(new StackPane(), 300, 300);

        scene.setOnMouseClicked((e)->{
            s.setName("Kevin");
        });
        stage.setScene(scene);
        stage.show();
    }

    @Override
    public void propertyChange(PropertyChangeEvent evt) {
        System.out.println("Variation of " + evt.getPropertyName());
		System.out.println("\t(" + evt.getOldValue() + 
							" -> " + evt.getNewValue() + ")");
		System.out.println("Property in object " + evt.getSource());
    }

    public static void main(String[] args) {
        launch(args);
    }
    
}
