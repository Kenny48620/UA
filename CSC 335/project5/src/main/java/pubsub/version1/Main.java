package pubsub.version1;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Podcast podcast = new Podcast("Tech Talk");
        Student student1 = new Student();
        Student student2 = new Student();

        // Subscribe the student object to the podcast
        podcast.subscribe(student1);
        podcast.subscribe(student2);

        // Change the name of the podcast
        podcast.setName("Java Advanced Topics");
    //    Thread.sleep(1000); // add a delay of 1 second

    }
}
