package pubsub.version3;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;


public class Student implements PropertyChangeListener{


    @Override
    public void propertyChange(PropertyChangeEvent evt) {
        System.out.println("Variation of " + evt.getPropertyName());
		System.out.println("\t(" + evt.getOldValue() + 
							" -> " + evt.getNewValue() + ")");
		System.out.println("Property in object " + evt.getSource());
    }
}
