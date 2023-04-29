package pubsub.version1;

import java.util.concurrent.Flow.Subscriber;
import java.util.concurrent.Flow.Subscription;


public class Student implements Subscriber<String>{

    private Subscription subscription;

    @Override
    public void onSubscribe(Subscription subscription) {
        // Store the subscription object for later use
        this.subscription = subscription;
        // Request one item from the publisher
        subscription.request(1);
    }

    @Override
    public void onNext(String item) {
        // Print the new podcast name received
        System.out.println("Student received new podcast name: " + item);
        // Request one more item from the publisher
        subscription.request(1);
    }

    @Override
    public void onError(Throwable throwable) {
        // Print the error message received from the publisher
        System.err.println("An error occurred: " + throwable.getMessage());
    }

    @Override
    public void onComplete() {
        // Print a message when the publisher has completed publishing items
        System.out.println("No more podcasts available.");
    }
    
}
