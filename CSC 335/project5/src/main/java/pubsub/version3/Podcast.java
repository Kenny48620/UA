package pubsub.version3;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

public class Podcast{
    String name;

    PropertyChangeSupport pcs;
    
    public Podcast(String name){
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
 
    // public void setProperty(String name) {
	// 	String oldName = name;
	// 	this.name = name;
	// 	pcs.firePropertyChange("theProperty", oldName, name);
	// }

    public String toString() { return "The subject object (podcast)"; };


}
