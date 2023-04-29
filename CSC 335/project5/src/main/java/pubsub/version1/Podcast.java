package pubsub.version1;

import java.util.concurrent.SubmissionPublisher;
import java.util.concurrent.Flow.Publisher;
import java.util.concurrent.Flow.Subscriber;

public class Podcast implements Publisher<String>{
    String name;
    SubmissionPublisher<String> publisher = new SubmissionPublisher<>();;
    public Podcast(String name){
        this.name = name;
    } 

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        publisher.submit(name);
    }

    @Override
    public void subscribe(Subscriber<? super String> subscriber) {
       publisher.subscribe(subscriber);
    }


}
