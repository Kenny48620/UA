package controller;

import java.util.HashMap;
import java.util.InputMismatchException;

import model.CryptogramModel;
/**
 * This is a controller of Crytogram
 * @author Kaichun Lee
 */
public class CryptogramController {
	private CryptogramModel model;

	/**
	 * Construrtor
	 * @param model a CryptogramModel object
	 */
	public CryptogramController (CryptogramModel model) {
		this.model = model;
	} 

	/**
	 * Check if game is over
	 * @return if game is over
	 */
	public boolean isGameOver() { 
		return  getUsersProgress().equals(model.getAnswer());
	}

	/**
	 * Call model setReplacement() to replace letter
	 * @param letterToReplace	letter that to replace
	 * @param replacementLetter replacement letter
	 */
	public void makeReplacement(char letterToReplace, char replacementLetter) { 
		model.setReplacement(letterToReplace, replacementLetter);
	}

	/**
	 * Call model getEncryptedString()
	 * @return a encrypted string
	 */
	public String getEncryptedQuote() { 
		/* for the view to display */
		return model.getEncryptedString();
	}

	/**
	 * Call model getUsersProgress()
	 * @return a decrypted string
	 */
	public String getUsersProgress() { 
		/* for the view to display */
		return model.getDecryptedString();
	}

	/**
	 * Display the letter frequencies in the encrypted quotation 
	 * (i.e., how many of letter X appear) like:
	 * A: 3 B: 8 C:4 D: 0 E: 12 F: 4 G: 6
	 */
	public void showFreq(){
		model.getFreq();
	}

	/**
	 * Display one correct mapping that has not yet been guessed
	 */
	public void showHint(){
		model.getHint();
	}

	/**
	 * Exit this game
	 */
	public void exitGame(){
		System.out.println("Exit game...");
		System.exit(0);
	}

	/**
	 * List avaliable commands
	 */
	public void giveHelp(){	
		System.out.println("a. replace X by Y – replace letter X by letter Y");
		System.out.println("   X = Y – a shortcut for this same command");
		System.out.println("b. freq – Display the letter frequencies in the encrypted quotation");
		System.out.println("c. hint – display one correct mapping that has not yet been guessed");
		System.out.println("d. exit – Ends the game early");
		System.out.println("e. help – List these commands");
	}

	/**
	 * Read a command from player
	 * @param line a string 
	 */
	public void readCommand(String line){
		// check if is a valid input
		String[] command = line.toUpperCase().split(" ");
		// command a
		if (command.length == 3 || command.length == 4){
			if (command[0].equals("REPLACE") && command[2].equals("BY")){
				checkValidInput(command[1]);
				checkValidInput(command[3]);
				char letter = command[1].charAt(0);
				char guess  = command[3].charAt(0);
				makeReplacement(letter, guess);
			}else if (command[1].equals("=")){
				checkValidInput(command[0]);
				checkValidInput(command[2]);
				char letter = command[0].charAt(0);
				char guess  = command[2].charAt(0);
				makeReplacement(letter, guess);
			}
		}else if (command.length == 1){
			checkValidInput(command[0]);
			switch (command[0]){
				// command b
				case "FREQ": 
					model.getFreq();
					break;
				// command c
				case "HINT": 
					model.getHint();
					break;
				// command d
				case "EXIT": 
					exitGame();
					break;
				// command e
				case "HELP": 
					giveHelp();
					break;
			}
		}
	}
	
	/**
	 * Check if line is valid
	 * @param line a string
	 */
	private void checkValidInput(String line){
		if (!line.matches("[A-Z]+")){
			throw new InputMismatchException("Error: input should be character");
		}
	}

	/**
	 * Display the current progress
	 * @return current progress
	 */
	public String displayCurProgress(){
		return model.getCurrentProgress();
	}
	/**
	 * Getter of guessMap
	 * @return guessMap
	 */
	public HashMap<Character, Character> getGuessMap(){
		return model.getGuessMap();
	}
	/**
	 * Getter of answerMap
	 * @return answerMap
	 */
	public HashMap<Character, Character> getAnswerMap(){
		return model.getAnswerMap();
	}

	/**
	 * Getter of hint array
	 * @return hint array
	 */
	public String[] getHintArray(){
		return model.getHint().split(" ");
	}

	/**
	 * Getter of freqMap
	 * @return freqMap
	 */
	public HashMap<Character, Integer> getFreqMap(){
		return model.getFreqMap();
	}
}

