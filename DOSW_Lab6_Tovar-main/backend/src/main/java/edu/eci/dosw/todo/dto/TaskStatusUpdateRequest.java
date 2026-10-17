package edu.eci.dosw.todo.dto;

import edu.eci.dosw.todo.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(
        @NotNull(message = "Status is required")
        TaskStatus status
) {
}
