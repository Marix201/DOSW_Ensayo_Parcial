package edu.eci.dosw.todo.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record TaskBatchRequest(
        @NotEmpty(message = "At least one task id is required")
        List<@NotNull(message = "Task ids must not be null") Long> ids
) {
}
