package model;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Observable;
import java.util.Random;

/**
 * This class is a model class for Cryptogram
 * @author Kaichun Lee
 */
public class CryptogramModel extends Observable{
	//private variable(s) to store the answer, encryption key, decryption key
	private HashMap<Character, Character> answerMap;// store answer
	private HashMap<Character, Character> guessMap; // stroe palyer guess
	private HashMap<Character, Integer>   freqMap; // count the letter frequencies in the encrypted quotation  

	private List<String> quotes; // store quotes
	private String quote;		 // selected quote
	private String encrypted;	 // encrypted quote    
	private String freq;		 // freq inormation

	private static final int START_LETTER_NUM  = 65; // start from A
	private static final int END_LETTER_NUM    = 91; // end at Z
	private static final int LINE_LIMIT_LENGTH = 80; // maximun line length

	private static final boolean DEBUG = false; // for debug

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
		guessMap  = new HashMap<>();
		freqMap  = new HashMap<>();

		// assign A-Z to key list, guess map
		for (char c=START_LETTER_NUM; c<END_LETTER_NUM; c++){
			valList.add(c);
			guessMap.put(c, '\0');
			freqMap.put(c, 0);
		}
		
		// map elements 
		answerMap = shuffleLetters(valList);
		// musk quote
		encrypted = muskQuote();
		// count letter frequence
		freq      = countFreq();
	}

    /**
	 * Record user's input to the letter
	 * @param encryptedChar   letter that to replace
	 * @param replacementChar replacement letter
	 */
	public void setReplacement(char encryptedChar, char replacementChar) {
		/* add to our decryption attempt */
		guessMap.put(encryptedChar, replacementChar);

		// new added 
		notifyGUI();
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

	private String muskQuote(){
		StringBuilder sb = new StringBuilder();
		
		for (int i=0; i<quote.length(); i++){
			char c = quote.charAt(i);
			if (answerMap.containsKey(c)){
				sb.append(answerMap.get(c));
			}else{
				sb.append(c);
			}
		}
		return sb.toString();
	}

	/**
	 * Prevent map to same letter
	 * @param valList a list that contains A-Z
	 * @return an answer that map encrypted letter to decrypted letter
	 */
	private HashMap<Character, Character> shuffleLetters(List<Character> valList){
		HashMap<Character, Character> tmpMap = new HashMap<>();
		int i;

		do{
			Collections.shuffle(valList);
			for (i=0; i<valList.size(); i++){
				char key = (char) (START_LETTER_NUM+i);
				char val = valList.get(i);
				// prevent to map to same letter
				if (key == val){
					break;
				}
				tmpMap.put(key, val); // shuffle element: original element
			}

		}while (i!=valList.size()); // if shuffle not succeed, do it again
		return tmpMap;
	}

	/**
	 * Count letter frequence
	 * @return a string that shows etter frequence
	 */
	private String countFreq(){
		// count frequence to map
		for (int i=0; i<encrypted.length(); i++){
			char c = encrypted.charAt(i);
			if (freqMap.containsKey(c)){
				freqMap.put(c, freqMap.get(c)+1);
			}
		}

		// covert frequence to a string
		StringBuilder sb = new StringBuilder();
		int lineMax = 1;
		for (char c=START_LETTER_NUM; c<END_LETTER_NUM; c++, lineMax++){
			int cFreq = freqMap.get(c);
			sb.append(c+": "+cFreq);
			if (lineMax % 7 == 0){
				sb.append("\n");
			}else{
				sb.append(" ");
			}
		}

		return sb.toString();
	}

	/**
	 * Display letter frequence
	 * @return letter frequence
	 */
	public String getFreq(){
		System.out.println(freq);
		return freq;
	}

	/**
	 * Display a hint to player
	 * @return a string that represent letter = letter
	 */
	public String getHint(){
		if (DEBUG){
			System.out.println("Hint start...");
		}

		// loop guess map or loop 
		for (Character answerKey:answerMap.keySet()){
			Character answerVal = answerMap.get(answerKey);
			Character guessKey  = answerMap.get(answerKey);
			Character guessVal  = guessMap.get(guessKey);	
			// ensure the element is appear in the quote && find guess key is map to anwer value, then check if 
			// guess key map to correct answer 	
			if (freqMap.get(answerVal)!=0 && guessKey == answerVal && guessVal != answerKey){
				String hint = String.format("Hint: %c = %c", answerVal, answerKey);
				System.out.println(hint);
		
				return hint;
			}
		}

		return "There is no hint left";
	}

	/**
	 * Display the cuurent progress information to player
	 * @return a string tha records the current progress
	 */
	public String getCurrentProgress(){
		String[] encryptedPieces = encrypted.split(" ");
		int[]    eachLength      = new int[encryptedPieces.length]; // used for guess because of space
		
		StringBuilder sb            = new StringBuilder();
		StringBuilder encryptedProg = new StringBuilder();

		// process encrypted string
		for (int i=0; i<encryptedPieces.length; i++){
			eachLength[i] = encryptedPieces[i].length();
			if (encryptedPieces[i].length() + encryptedProg.length() > LINE_LIMIT_LENGTH){
				// add new line
				sb.append(encryptedProg+"\n\n");
				// clean buffer
				encryptedProg.delete(0, encryptedProg.length()); 
			}

			encryptedProg.append(encryptedPieces[i]);

			if (encryptedProg.length() != LINE_LIMIT_LENGTH){
				encryptedProg.append(" ");
			}
		}
		sb.append(encryptedProg+"\n");
		
		// process guess string
		StringBuilder decryptedProg = new StringBuilder(getDecryptedString());
		StringBuilder userProg      = new StringBuilder();
	
		int next = 0;
		for (int i=0, start=0; i<eachLength.length; i++){
			if (eachLength[i] + userProg.length() > LINE_LIMIT_LENGTH){
				userProg.append("\n");
				// combine with encrypted string
				sb.insert(next, userProg);
				// update next line index to insert
				next += userProg.length()*2+1; // extra "\n" for previous
				// clean buffer
				userProg.delete(0, userProg.length());
			}
			userProg.append(decryptedProg.subSequence(start, start+eachLength[i]));
			start += 1+eachLength[i]; // extra " " count as length = 1

			if (userProg.length() != LINE_LIMIT_LENGTH){
				userProg.append(" ");
			}
		}

		// process tail
		userProg.append("\n");
		sb.insert(next, userProg);

		String curProg = sb.toString();
		System.out.println(curProg);
		return curProg;
	}

	/**
	 * Notify the change to the observer GUI CryptogramGUIView
	 */
	public void notifyGUI(){
		setChanged();
		notifyObservers(); // call observer.update() 
		if (DEBUG){
			System.out.println("Notify GUI done");
		}
	}

	/**
	 * Getter of guessMap
	 * @return guessMap
	 */
	public HashMap<Character, Character> getGuessMap(){
		return guessMap;
	}

	/**
	 * Getter of answerMap
	 * @return answerMap
	 */
	public HashMap<Character, Character> getAnswerMap(){
		return answerMap;
	}

	/**
	 * Getter of freqMap
	 * @return freqMap
	 */
	public HashMap<Character, Integer> getFreqMap(){
		return freqMap;
	}
}