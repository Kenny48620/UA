package pubsub.version2;
import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

public class Subject {

	String property="initial";
	// contain a support object instead of extending the support class
	PropertyChangeSupport pcs = new  PropertyChangeSupport(this);

	public void addObserver(PropertyChangeListener l) {
		pcs.addPropertyChangeListener("theProperty", l);
	}
	
	public void setProperty(String val) {
		String old = property;
		property = val;
		pcs.firePropertyChange("theProperty", old, val);
	}
	
	public String toString() { return "The subject object"; };
}