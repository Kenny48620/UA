package model;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Random;
/**
 * This class is a model class for Cryptogram
 * @author Kaichun Lee
 */
public class CryptogramModel {
	//private variable(s) to store the answer, encryption key, decryption key
	private HashMap<Character, Character> answerMap;// store answer
	private HashMap<Character, Character> guessMap; // stroe palyer guess
	private List<String> quotes; // store quotes
	private String quote;		 // selected quote
	private String encrypted;	 // encrypted quote    

	private static final boolean DEBUG = true; // for debug

	/**
	 * Constructor that responsible for reading file, choosing quote and generate encrypted quote 
	 */
	public CryptogramModel() { 
		if (DEBUG){
			System.out.println("CryptogramModel() start...\n\n");
		}
		quotes = new ArrayList<>();

		/* Read a random line from the quotes.txt file. Make the keys and set the answer */ 
		BufferedReader bf = null;
		// read file 
		try {
			bf = new BufferedReader(new FileReader("quotes.txt"));
			String line;
			while ((line = bf.readLine()) != null){
				quotes.add(line.toUpperCase());
			}
			bf.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		// randomly get a quote
		Random random  = new Random();
		int    index   = random.nextInt(quotes.size());
		quote = quotes.get(index);

		List<Character> valList = new ArrayList<>();
		// assign A-Z to key list
		for (int i=65; i<91; i++){
			valList.add((char) i);
		}
		// shuffle the key
		Collections.shuffle(valList);
		
		// initialize maps
		answerMap = new HashMap<>();
		guessMap  = new HashMap<>();
		// map elements 
		for (int i=0; i<valList.size(); i++){
			answerMap.put((char)(65+i), valList.get(i)); // shffle element: original element
			guessMap.put((char)(65+i), ' ');
		}
		
		// musk quote
		StringBuilder sb = new StringBuilder();
		for (int i=0; i<quote.length(); i++){
			char c = quote.charAt(i);
			if (answerMap.containsKey(c)){
				sb.append(answerMap.get(c));
			}else{
				sb.append(c);
			}
		}
		encrypted = sb.toString();
	}

    /**
	 * Record user's input to the letter
	 * @param encryptedChar   letter that to replace
	 * @param replacementChar replacement letter
	 */
	public void setReplacement(char encryptedChar, char replacementChar) {
		/* add to our decryption attempt */
		guessMap.put(encryptedChar, replacementChar);
	}

	/**
	 * Getter for encrypted string
	 * @return a encrypted string 
	 */
	public String getEncryptedString() {
		/* return the fully encrypted string */
		return encrypted;
	}

	/**
	 * Getter for decrypted string
	 * @return a decrypted string
	 */
	public String getDecryptedString() {
		/* return the decrypted string with the guessed replacements or spaces */
		StringBuilder sb = new StringBuilder();
		for (int i=0; i<encrypted.length(); i++){
			char c = encrypted.charAt(i);
			if (guessMap.containsKey(c)){
				sb.append(guessMap.get(c));
			}else{
				sb.append(c);
			}
		}

		return sb.toString();
	}

	/**
	 * Getter for answer 
	 * @return answer string quote
	 */
	public String getAnswer() {
		/* return the answer */
		return quote;
	}
}