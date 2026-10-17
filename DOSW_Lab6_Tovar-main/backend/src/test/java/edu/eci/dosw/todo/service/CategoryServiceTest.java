package edu.eci.dosw.todo.service;

import edu.eci.dosw.todo.dto.CategoryRequest;
import edu.eci.dosw.todo.dto.CategoryResponse;
import edu.eci.dosw.todo.entity.CategoryEntity;
import edu.eci.dosw.todo.exception.CategoryConflictException;
import edu.eci.dosw.todo.exception.CategoryNotFoundException;
import edu.eci.dosw.todo.repository.CategoryRepository;
import edu.eci.dosw.todo.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private CategoryEntity buildCategory(Long id, String name) {
        CategoryEntity category = new CategoryEntity();
        category.setId(id);
        category.setName(name);
        return category;
    }

    @Test
    void findAll_shouldReturnCategoriesSortedByName() {
        when(categoryRepository.findAll()).thenReturn(List.of(buildCategory(1L, "work"), buildCategory(2L, "Home")));

        assertThat(categoryService.findAll()).extracting(CategoryResponse::name).containsExactly("Home", "work");
    }

    @Test
    void findById_shouldThrowWhenCategoryDoesNotExist() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.findById(99L))
                .isInstanceOf(CategoryNotFoundException.class)
                .hasMessage("Category with id 99 was not found");
    }

    @Test
    void create_shouldTrimAndSaveName() {
        when(categoryRepository.existsByNameIgnoreCase("Work")).thenReturn(false);
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(invocation -> {
            CategoryEntity saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        CategoryResponse result = categoryService.create(new CategoryRequest("  Work "));

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Work");
    }

    @Test
    void create_shouldRejectDuplicateName() {
        when(categoryRepository.existsByNameIgnoreCase("Work")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.create(new CategoryRequest("Work")))
                .isInstanceOf(CategoryConflictException.class)
                .hasMessage("Category 'Work' already exists");
        verify(categoryRepository, never()).save(any(CategoryEntity.class));
    }

    @Test
    void update_shouldRenameCategory() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(buildCategory(1L, "Old")));
        when(categoryRepository.existsByNameIgnoreCaseAndIdNot("New", 1L)).thenReturn(false);
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThat(categoryService.update(1L, new CategoryRequest("New")).name()).isEqualTo("New");
    }

    @Test
    void update_shouldRejectDuplicateName() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(buildCategory(1L, "Old")));
        when(categoryRepository.existsByNameIgnoreCaseAndIdNot("Taken", 1L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.update(1L, new CategoryRequest("Taken")))
                .isInstanceOf(CategoryConflictException.class);
    }

    @Test
    void update_shouldThrowWhenCategoryDoesNotExist() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.update(99L, new CategoryRequest("X")))
                .isInstanceOf(CategoryNotFoundException.class);
    }

    @Test
    void delete_shouldDeleteUnusedCategory() {
        when(categoryRepository.existsById(1L)).thenReturn(true);
        when(taskRepository.existsByCategoryId(1L)).thenReturn(false);

        categoryService.delete(1L);

        verify(categoryRepository).deleteById(1L);
    }

    @Test
    void delete_shouldRejectCategoryInUse() {
        when(categoryRepository.existsById(1L)).thenReturn(true);
        when(taskRepository.existsByCategoryId(1L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.delete(1L))
                .isInstanceOf(CategoryConflictException.class)
                .hasMessage("Category with id 1 is assigned to tasks and cannot be deleted");
        verify(categoryRepository, never()).deleteById(any());
    }

    @Test
    void delete_shouldThrowWhenCategoryDoesNotExist() {
        when(categoryRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> categoryService.delete(99L))
                .isInstanceOf(CategoryNotFoundException.class);
    }
}
