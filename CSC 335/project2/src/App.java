import java.util.InputMismatchException;

public class App {
    public static void main(String[] args){
        // for (char c = 65; c<91; c++){
        //     System.out.println(c);
        // }

        
        StringBuilder sb = new StringBuilder("asd");
        sb.append("\n\n");

        sb.insert(1, "99");

        System.out.println("Talk is cheap. Show me the code. - Linus Torvalds".toUpperCase());
    }
}
