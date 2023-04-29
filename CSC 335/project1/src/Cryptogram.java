import model.CryptogramModel;

import java.util.InputMismatchException;
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
			System.out.println(game.getEncryptedQuote());
			System.out.print("Enter the letter to replace: ");
			// char letter = input.next().toUpperCase().charAt(0);
			char letter = checkValidInput(input.nextLine());

			System.out.print("Enter its replacement: ");
			//char guess = input.next().toUpperCase().charAt(0);
			char guess = checkValidInput(input.nextLine());

			game.makeReplacement(letter, guess);
			System.out.println();
			System.out.println(game.getUsersProgress());

		}
		input.close();

		System.out.println(game.getEncryptedQuote());
		System.out.println();
		System.out.println("You got it!");
	}

	/**
	 * Chekc if input valid or not
	 * @param line input from player
	 * @return a character
	 */
	public static char checkValidInput(String line){
		// check if input only one character
		if (line.length() > 1){
			throw new InputMismatchException("Error: input should have only one character");
		}
		// check if input is valid character
		if (!line.matches("[A-Za-z]")){
			throw new InputMismatchException("Error: input should be character");
		}
		return line.toUpperCase().charAt(0);
	}
}
 