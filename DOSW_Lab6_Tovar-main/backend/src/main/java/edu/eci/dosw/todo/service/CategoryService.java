package edu.eci.dosw.todo.service;

import edu.eci.dosw.todo.dto.CategoryRequest;
import edu.eci.dosw.todo.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> findAll();

    CategoryResponse findById(Long id);

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);
}
