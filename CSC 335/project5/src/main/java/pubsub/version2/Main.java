package pubsub.version2;

public class Main {
    public static void main(String[] args) {
        Subject s = new Subject();
		
		Concerned o = new Concerned();
		
		s.addObserver(o);
		
		s.setProperty("new");
    }
}
