package edu.eci.dosw.todo.controller;

import edu.eci.dosw.todo.dto.CategoryRequest;
import edu.eci.dosw.todo.dto.CategoryResponse;
import edu.eci.dosw.todo.exception.CategoryConflictException;
import edu.eci.dosw.todo.exception.CategoryNotFoundException;
import edu.eci.dosw.todo.service.CategoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CategoryController.class)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CategoryService categoryService;

    @Test
    void findAll_shouldReturn200() throws Exception {
        when(categoryService.findAll()).thenReturn(List.of(new CategoryResponse(1L, "Home"), new CategoryResponse(2L, "Work")));

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Home"));
    }

    @Test
    void findById_shouldReturn404WhenMissing() throws Exception {
        when(categoryService.findById(99L)).thenThrow(new CategoryNotFoundException(99L));

        mockMvc.perform(get("/api/v1/categories/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Category with id 99 was not found"));
    }

    @Test
    void create_shouldReturn201() throws Exception {
        when(categoryService.create(any(CategoryRequest.class))).thenReturn(new CategoryResponse(1L, "Work"));

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CategoryRequest("Work"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Work"));
    }

    @Test
    void create_shouldReturn400WhenNameIsBlank() throws Exception {
        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"  \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("name: Name is required"));
    }

    @Test
    void create_shouldReturn400WhenNameIsTooLong() throws Exception {
        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CategoryRequest("x".repeat(51)))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("name: Name must have at most 50 characters"));
    }

    @Test
    void create_shouldReturn409WhenNameIsDuplicated() throws Exception {
        when(categoryService.create(any(CategoryRequest.class)))
                .thenThrow(CategoryConflictException.duplicateName("Work"));

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Work\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Category 'Work' already exists"));
    }

    @Test
    void update_shouldReturn200() throws Exception {
        when(categoryService.update(eq(1L), any(CategoryRequest.class))).thenReturn(new CategoryResponse(1L, "New"));

        mockMvc.perform(put("/api/v1/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New"));
    }

    @Test
    void update_shouldReturn404WhenMissing() throws Exception {
        when(categoryService.update(eq(99L), any(CategoryRequest.class))).thenThrow(new CategoryNotFoundException(99L));

        mockMvc.perform(put("/api/v1/categories/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/v1/categories/1"))
                .andExpect(status().isNoContent());

        verify(categoryService).delete(1L);
    }

    @Test
    void delete_shouldReturn404WhenMissing() throws Exception {
        doThrow(new CategoryNotFoundException(99L)).when(categoryService).delete(99L);

        mockMvc.perform(delete("/api/v1/categories/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_shouldReturn409WhenCategoryIsInUse() throws Exception {
        doThrow(CategoryConflictException.inUse(1L)).when(categoryService).delete(1L);

        mockMvc.perform(delete("/api/v1/categories/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Category with id 1 is assigned to tasks and cannot be deleted"));
    }
}
