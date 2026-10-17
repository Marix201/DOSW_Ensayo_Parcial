package edu.eci.dosw.todo.controller;

import edu.eci.dosw.todo.dto.TaskBatchRequest;
import edu.eci.dosw.todo.dto.TaskCreateRequest;
import edu.eci.dosw.todo.dto.TaskResponse;
import edu.eci.dosw.todo.dto.TaskUpdateRequest;
import edu.eci.dosw.todo.entity.TaskPriority;
import edu.eci.dosw.todo.entity.TaskStatus;
import edu.eci.dosw.todo.exception.TaskNotFoundException;
import edu.eci.dosw.todo.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TaskService taskService;

    private TaskResponse buildResponse(Long id, String title) {
        return new TaskResponse(
                id,
                title,
                "Description of " + title,
                TaskStatus.PENDING,
                TaskPriority.MEDIUM,
                LocalDate.of(2026, 9, 30),
                LocalDateTime.of(2026, 9, 28, 8, 0));
    }

    @Test
    void findAll_shouldReturn200WithTasks() throws Exception {
        when(taskService.findAll()).thenReturn(List.of(buildResponse(1L, "Task A"), buildResponse(2L, "Task B")));

        mockMvc.perform(get("/api/v1/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Task A"))
                .andExpect(jsonPath("$[1].title").value("Task B"));
    }

    @Test
    void findById_shouldReturn200WhenTaskExists() throws Exception {
        when(taskService.findById(1L)).thenReturn(buildResponse(1L, "Task A"));

        mockMvc.perform(get("/api/v1/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Task A"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.priority").value("MEDIUM"));
    }

    @Test
    void findById_shouldReturn404WhenTaskDoesNotExist() throws Exception {
        when(taskService.findById(99L)).thenThrow(new TaskNotFoundException(99L));

        mockMvc.perform(get("/api/v1/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Task with id 99 was not found"));
    }

    @Test
    void create_shouldReturn201WhenRequestIsValid() throws Exception {
        TaskCreateRequest request = new TaskCreateRequest(
                "New task", "Some description", TaskPriority.HIGH, LocalDate.of(2026, 10, 1));
        when(taskService.create(any(TaskCreateRequest.class))).thenReturn(buildResponse(10L, "New task"));

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("New task"));
    }

    @Test
    void create_shouldReturn400WhenTitleIsBlank() throws Exception {
        TaskCreateRequest request = new TaskCreateRequest("", "Some description", TaskPriority.HIGH, null);

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("title: Title is required"));
    }

    @Test
    void update_shouldReturn200WhenTaskExists() throws Exception {
        TaskUpdateRequest request = new TaskUpdateRequest(
                "Updated title", "Updated description", TaskStatus.IN_PROGRESS, TaskPriority.LOW, null);
        TaskResponse updated = new TaskResponse(
                1L, "Updated title", "Updated description", TaskStatus.IN_PROGRESS,
                TaskPriority.LOW, null, LocalDateTime.of(2026, 9, 28, 8, 0));
        when(taskService.update(eq(1L), any(TaskUpdateRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated title"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.priority").value("LOW"));
    }

    @Test
    void update_shouldReturn404WhenTaskDoesNotExist() throws Exception {
        TaskUpdateRequest request = new TaskUpdateRequest(
                "Title", null, TaskStatus.PENDING, TaskPriority.MEDIUM, null);
        when(taskService.update(eq(99L), any(TaskUpdateRequest.class))).thenThrow(new TaskNotFoundException(99L));

        mockMvc.perform(put("/api/v1/tasks/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Task with id 99 was not found"));
    }

    @Test
    void delete_shouldReturn204WhenTaskExists() throws Exception {
        mockMvc.perform(delete("/api/v1/tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskService).delete(1L);
    }

    @Test
    void delete_shouldReturn404WhenTaskDoesNotExist() throws Exception {
        doThrow(new TaskNotFoundException(99L)).when(taskService).delete(99L);

        mockMvc.perform(delete("/api/v1/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void deleteBatch_shouldReturn204() throws Exception {
        mockMvc.perform(post("/api/v1/tasks/batch/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TaskBatchRequest(List.of(1L, 2L)))))
                .andExpect(status().isNoContent());

        verify(taskService).deleteBatch(any(TaskBatchRequest.class));
    }

    @Test
    void deleteBatch_shouldReturn400WhenIdsAreEmpty() throws Exception {
        mockMvc.perform(post("/api/v1/tasks/batch/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("ids: At least one task id is required"));
    }

    @Test
    void deleteBatch_shouldReturn400WhenIdsAreMissing() throws Exception {
        mockMvc.perform(post("/api/v1/tasks/batch/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteBatch_shouldReturn404WhenAnIdDoesNotExist() throws Exception {
        doThrow(new TaskNotFoundException(99L)).when(taskService).deleteBatch(any(TaskBatchRequest.class));

        mockMvc.perform(post("/api/v1/tasks/batch/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[1,99]}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Task with id 99 was not found"));
    }

    @Test
    void completeBatch_shouldReturn200WithTasks() throws Exception {
        when(taskService.completeBatch(any(TaskBatchRequest.class)))
                .thenReturn(List.of(buildResponse(1L, "Task A"), buildResponse(2L, "Task B")));

        mockMvc.perform(post("/api/v1/tasks/batch/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[1,2]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void completeBatch_shouldReturn400WhenIdsAreEmpty() throws Exception {
        mockMvc.perform(post("/api/v1/tasks/batch/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[]}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteCompleted_shouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/v1/tasks/completed"))
                .andExpect(status().isNoContent());

        verify(taskService).deleteCompleted();
    }
}
