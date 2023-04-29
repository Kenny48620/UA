package view;
/**
 * @author Kaichun Lee
 */
import javafx.application.Application;

/**
 * This class is a driver class providing the player can choose to 
 * play the game in two different ways, which is in text-oriented UI or GUI view.
 * The default is GUI view.
 */
public class Cryptogram{
	public static void main(String[] args) {
		if(args.length > 0 && args[0].equals("-text")) {
			CryptogramTextView textView = new CryptogramTextView();
			textView.start();
		}else{
			Application.launch(CryptogramGUIView.class, args);	
		}	
	}
}