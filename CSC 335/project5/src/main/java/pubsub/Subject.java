package pubsub;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

public class Subject {
    String name;

    PropertyChangeSupport pcs;
    
    public Subject(String name){
        this.name = name;
        pcs = new  PropertyChangeSupport(this);
    } 

    public String getName() {
        return name;
    }

    public void setName(String name) {
        String oldName = this.name;
		this.name = name;
		pcs.firePropertyChange("theProperty", null, name);
    }

    public void addObserver(PropertyChangeListener listener) {
		pcs.addPropertyChangeListener("theProperty", listener);
	}

    public String toString() { return "The subject object (podcast)"; };
}
