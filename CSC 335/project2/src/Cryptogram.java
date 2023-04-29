import model.CryptogramModel;

import java.util.Scanner;
import controller.CryptogramController;
/**
 * This class is a driver class for CryptogramController.java and CryptogramModel.java
 * @author Kaichun Lee
 */
public class Cryptogram {

	public static void main(String[] args) {
		CryptogramController game  = new CryptogramController(new CryptogramModel());
		Scanner              input = new Scanner(System.in);
		
		while(!game.isGameOver()){
			game.displayCurProgress();
			System.out.print("Enter a command (type help to see commands):");
			game.readCommand(input.nextLine());
			System.out.println();
		}
		input.close();

		game.displayCurProgress();
		System.out.println();
		System.out.println("You got it!");
	}
}
 