package com.spacedebris.ui;

import com.spacedebris.model.DashboardStats;
import com.spacedebris.service.DashboardService;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class SpaceDebrisDashboardApp extends Application {
    @Override
    public void start(Stage stage) {
        DashboardService dashboardService = new DashboardService(null);
        DashboardStats stats = dashboardService.sampleStats();

        VBox root = new VBox(10,
                new Label("Space Debris Dashboard (Simulated Data)"),
                new Label("Total tracked debris: " + stats.getTotalTrackedDebris()),
                new Label("Active satellites: " + stats.getActiveSatellites()),
                new Label("Close approaches: " + stats.getCloseApproaches()),
                new Label("High-risk events: " + stats.getHighRiskEvents()),
                new Label("Pending mitigation actions: " + stats.getPendingMitigationActions())
        );
        root.setPadding(new Insets(16));

        stage.setScene(new Scene(root, 460, 220));
        stage.setTitle("Space Debris Management Dashboard");
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
