package controller;

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
		return model.getDecryptedString().equals(model.getAnswer());
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
}