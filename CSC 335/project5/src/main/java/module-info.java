module project5 {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.desktop;

    opens project5 to javafx.fxml;
    opens pubsub to javafx.fxml;

    exports project5;
    exports pubsub;
}
