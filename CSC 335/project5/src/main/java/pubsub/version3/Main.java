package pubsub.version3;

public class Main {
    public static void main(String[] args){
        Podcast podcast = new Podcast("Tec Talk");
		
		Student s1 = new Student();
		
		podcast.addObserver(s1);
		
		podcast.setName("Coding interview");

    }
}
