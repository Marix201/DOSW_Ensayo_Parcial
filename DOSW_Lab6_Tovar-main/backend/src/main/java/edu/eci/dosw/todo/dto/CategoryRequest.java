package edu.eci.dosw.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 50, message = "Name must have at most 50 characters")
        String name
) {
}
