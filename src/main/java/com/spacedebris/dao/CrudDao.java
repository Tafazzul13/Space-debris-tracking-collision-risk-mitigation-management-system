package com.spacedebris.dao;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface CrudDao<T, ID> {
    int create(T entity) throws SQLException;

    Optional<T> findById(ID id) throws SQLException;

    List<T> findAll() throws SQLException;

    boolean update(T entity) throws SQLException;

    boolean deleteById(ID id) throws SQLException;
}
