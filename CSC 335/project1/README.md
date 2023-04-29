# Cryptograms

A cryptogram is a word puzzle based upon a simple substitution cypher. 
The letters of a quotation
are replaced with different letters such that:
1. All occurrences of the same letter are replaced with the same one
2. No replacement letter is ever used twice
3. All letters are uppercase
4. Punctuation is not altered
5. Spaces remain where they originally were
6. No letter stands for itself (We will ignore this one)

So if we had the phrase:

```
HELLO WORLD
```

We might generate a random encryption key that says all H should be 
replaced by T, E by R, L by Z, O
by X, etc., yielding a cryptogram of:

```
TRZZX AXPZE
```

The puzzle is for a user, presented with the encrypted version above, to 
reproduce the original
text by guessing the substitutions that were made. Knowledge of how 
words work in English usually
gives the first attempts. The most common letter in English is 'E', the 
most common three-letter
word is 'THE', the sequence of letters 'QQ' never occurs, but 'OO', 
'LL', or 'SS' might.

You can play some online for yourself to see: 
<https://www.cryptograms.org/play.php>

The purpose of this project is to use HashMaps to create cryptograms, 
and let a human user solve them.

## Example Run

```
JWSI ZN KRBWP. NRYF LB JRB KYVB. - SZGQN JYTHWSVN 
Enter the letter to replace: J
Enter its replacement: T

T            .         T       . -       T        
JWSI ZN KRBWP. NRYF LB JRB KYVB. - SZGQN JYTHWSVN 
Enter the letter to replace: R
Enter its replacement: H

T        H   .  H      TH      . -       T        
JWSI ZN KRBWP. NRYF LB JRB KYVB. - SZGQN JYTHWSVN 
Enter the letter to replace: B
Enter its replacement: E

T        HE  .  H    E THE    E. -       T        
JWSI ZN KRBWP. NRYF LB JRB KYVB. - SZGQN JYTHWSVN 

...

TALK IS CHEAP. SHOW ME THE CODE. - LINUS TORVALDS 
JWSI ZN KRBWP. NRYF LB JRB KYVB. - SZGQN JYTHWSVN

You got it!
```

## Writing the Cryptogram Program
We have provided a file, quotes.txt that contains some 
programming-related quotations. Select a random quote (one line in the 
file) to be the puzzle. Generate a random key for the substitution 
cypher by creating a List of the letters A-Z and using 
Collections.shuffle() to permute them. Create a HashMap that maps 
Characters to Characters and for each letter, associate it with one 
element from the randomly shuffled List.
Encode the chosen quotation by replacing the letters of the quote with 
the shuffled version using your HashMap.
Have an additional HashMap for the user's attempt to solve the puzzle. 
As the user enters their guesses, add the mapping to their HashMap and 
show them their progress by using the HashMap to replace the encrypted 
characters with their guess ones.
A user is always free to change a letter to something else.
The game is over when the user's guesses turn the encrypted quote back 
into the original quotation.

### Model/View/Controller
A common pattern for writing programs is known as MVC (Model/View/Controller). This pattern applies whenever we have some problem we can model (like a game board) and a user interface that displays and interacts with that model (the view). The controller is the code that manipulates the model in response to actions from the view.
The idea of MVC is that each part of the program is sufficiently abstracted from each other that they can change without needing to modify the other parts. For instance, our view is currently a textual interface, but later in the course, we could alter this to be a graphical user interface. If we did that, ideally, we would not need to change the model or the controller, only the view code.
For us, the implementation of the model is very simple: a few Strings for the quotes and a couple of HashMaps for the encryption key and the guessed key.
The view is a simple text-based program as we have written many times before. It will prompt the user for their replacements until they solve the puzzle.
The controller links these two things together, expressing how to manipulate the model in terms of the “verbs” of the game. 
We will then make three classes:
1.	A main class (named Cryptograms) that serves as our view, creates the Model and Controller, and deals with user input and output.
2.	A model class (named CryptogramModel) that stores the representation of guesses so far and uses a constructor and accessors to create and query the solution the player is trying to guess, defined as follows:
```Java
class CryptogramModel {
	//private variable(s) to store the answer, encryption key, decryption key
     
	public CryptogramModel() { 
		/* Read a random line from the quotes.txt file. Make the keys and set the answer */ 
	}
     
	public void setReplacement(char encryptedChar, char replacementChar) {
		/* add to our decryption attempt */
	}

	public String getEncryptedString() {
		/* return the fully encrypted string */
	}

	public String getDecryptedString() {
		/* return the decrypted string with the guessed replacements or spaces */
	}

	public String getAnswer() {
		/* return the answer */
	}
}
```

3.	A controller class named (CryptogramController) that is defined as follows:
```Java
class CryptogramController {
	public CryptogramController (CryptogramModel model) { ... }
	public boolean isGameOver() { ... }
	public void makeReplacement(char letterToReplace, char replacementLetter) { ... }
	public String getEncryptedQuote() { /* for the view to display */ }
	public String getUsersProgress() { /* for the view to display */ }
}
```

You are to provide the implementation of all three classes, but you must define your controller and model using at least the methods above. Any additional methods or fields you want to add must be private to your classes. Only public constants may be added, if necessary.



## Requirements

- You need a working implementation of the cryptogram puzzle game that 
uses a HashMap class to 
    1. Store the random encryption key
    2. Encrypt the quotation
    3. Store the player's decryption mappings
    4. Decrypt only those letters you have entered a guess for 
	
- A Cryptogram, CryptogramModel, and CryptogramController class with only the above public methods
- Program does not crash for any input, but more complex error handling is something we will discuss later
- Use a good commenting style based upon what you have learned already. We will have more to discuss about this soon.

 
## Submission
 
 As always, the last pushed commit prior to the due date will be graded.
 
 


