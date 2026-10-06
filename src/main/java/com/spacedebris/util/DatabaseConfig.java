package com.spacedebris.util;

public final class DatabaseConfig {
    private DatabaseConfig() {
    }

    public static String getUrl() {
        return System.getenv().getOrDefault("DB_URL", "jdbc:mysql://localhost:3306/space_debris_db");
    }

    public static String getUsername() {
        return System.getenv().getOrDefault("DB_USERNAME", "root");
    }

    public static String getPassword() {
        return System.getenv().getOrDefault("DB_PASSWORD", "");
    }
}
