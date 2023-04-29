CSC 335 Project 2: More Cryptograms  
===============================================

Design is only an issue when reuse is a concern. If something you create is used and discarded, effort on the design may be wasted. We need to revisit code to understand what good design enables and what bad design puts in our way. In this project, we will attempt to validate some of our choices in Project 1 by adding new features to our code base, and we will bring our project up to more rigorous standard of coding, so we can be sure our code is correct as it grows and remember what it does as time goes on.

New Features
============

One of the ways in which we can test our design decisions is to see how easily
we can add new features or modify existing behaviors.

For this stage of our project, we will be asking you to add the following
features:

1.  It was possible in project 1 for a letter to be mapped to itself since we
    just did a random shuffle of the alphabet. For this project, we should
    enforce the constraint that no letter maps to itself.

2.  We want to add in new functionality, such as letter frequency and hints. To
    this end, we are going to change the user interface to be able to accept
    *commands* as opposed to just simply entering key, value pairs.  
      
    The program will now prompt the user:  
      
    Enter a command (type help to see commands):  
      
    The commands we will support are:
    1.  **replace X by Y** – replace letter X by letter Y in our attempted
        solution    
        **X = Y** – a shortcut for this same command
    2.  **freq** – Display the letter frequencies in the encrypted quotation
        (i.e., how many of letter X appear) like:    
        A: 3 B: 8 C:4 D: 0 E: 12 F: 4 G: 6  
        *(and so on, 7 per line for 4 lines)*
    3.  **hint –** display one correct mapping that has not yet been guessed
    4.  **exit –** Ends the game early
    5.  **help** – List these commands

3.  We want to support arbitrarily long quotes (quotes.txt in the new project
    folder has some longer ones). The ones in Project 1 were limited to \<= 80
    characters so they fit on a normal console terminal line without wrapping.
    Wrapping is a problem because we want to be able to line up the guess on top
    of the encrypted quote, and that’s not possible if we just display a long
    quote and have it span across multiple lines automatically.  
      
    We will need to process the encrypted quote and the guess so far strings so
    that we only display them such that they fit appropriately (break each at
    whitespace or punctuation so that each part does not exceed 80 characters).
    For example, if our screen was only 10 letters wide, and we had the example
    from Project 1:  
    
```
      T        HE  .  H    E THE    E. -       T       
      JWSI ZN KRBWP. NRYF LB JRB KYVB. - SZGQN JYTHWSVN
```   
   we’d want to do (the lines are just to show you the rows and columns of the
   screen):

| T |   |   |   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|---|---|---|
| J | W | S | I |   | Z | N |   |   |   |
|   |   |   |   |   |   |   |   |   |   |
|   | H | E |   |   |   |   |   |   |   |
| K | R | B | W | P | . |   |   |   |   |
|   |   |   |   |   |   |   |   |   |   |
|   | H |   |   |   |   | E |   |   |   |
| N | R | Y | F |   | L | B |   |   |   |

*(and so on…) -- this table might not render well in markdown, use the pdf version from D2L*

Best Practices
==============

We also want to take the time to fully document our program. We are considering
three ways to document in this course:

1.  Javadoc comments

2.  UML Diagrams

3.  JUnit test cases

JavaDoc
-------

For this assignment, you are required to use javadoc comments for every class
and method to describe their purpose (in a short initial sentence), their design
and high-level implementation choices (in a following paragraph), and then to
document the way to call our methods, using at minimum the \@param, \@return,
and \@throws tags where necessary.

As part of your submission, you should include a docs/ folder that shows the
generated HTML from your javadoc comments

UML Diagram
-----------

We can use UML in two parts of the development process. First, we can use it to
plan our design before we write any code at all. Additionally, we can use it to
document what we created after the fact. For this project, we will document the
design of our game using a UML Class Diagram to model both the classes of our
program and their relationships. We do not need to diagram any of the classes
from the Java Class Library.

To draw your UML diagram, please use the diagramming tool <http://www.draw.io>
When you are done, save it to your Device as CryptogramsUML.xml and add it to
your git repository. Make sure it is there as part of your final commit to be
graded.

JUnit Test Cases
----------------

We have provided a mostly blank CryptogramTests.java file that uses JUnit to
test the methods of your program. You are required to add test cases to this
file to have \>90% statement coverage, with the 10% that is missing mostly
coming from the short regions of code where you do user or file input.

Requirements
============

-   A working Java implementation of the Cryptogram program that is modified
    with the new features as described above.

    -   As before, if something isn’t specified in its design, you are allowed
        to make a reasonable choice as to how to do it. This time, however, you
        know something more than you did before: that you might be asked to
        change the way this code works in the future in terms of functionality
        and/or design.

-   All of the documentation as described above: JUnit tests with \>=90%
    statement coverage, JavaDoc for every class and method, and a UML diagram
    with all classes you created.

**Submission**
==============

As always, the last pushed commit prior to the due date will be graded.
