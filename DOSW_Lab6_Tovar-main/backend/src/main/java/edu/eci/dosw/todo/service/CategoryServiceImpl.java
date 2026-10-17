package edu.eci.dosw.todo.service;

import edu.eci.dosw.todo.dto.CategoryRequest;
import edu.eci.dosw.todo.dto.CategoryResponse;
import edu.eci.dosw.todo.entity.CategoryEntity;
import edu.eci.dosw.todo.exception.CategoryConflictException;
import edu.eci.dosw.todo.exception.CategoryNotFoundException;
import edu.eci.dosw.todo.repository.CategoryRepository;
import edu.eci.dosw.todo.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final TaskRepository taskRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, TaskRepository taskRepository) {
        this.categoryRepository = categoryRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(category -> category.getName().toLowerCase()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return toResponse(getEntityOrThrow(id));
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw CategoryConflictException.duplicateName(name);
        }
        CategoryEntity category = new CategoryEntity();
        category.setName(name);
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        CategoryEntity category = getEntityOrThrow(id);
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw CategoryConflictException.duplicateName(name);
        }
        category.setName(name);
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new CategoryNotFoundException(id);
        }
        if (taskRepository.existsByCategoryId(id)) {
            throw CategoryConflictException.inUse(id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryEntity getEntityOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }

    private CategoryResponse toResponse(CategoryEntity category) {
        return new CategoryResponse(category.getId(), category.getName());
    }
}
