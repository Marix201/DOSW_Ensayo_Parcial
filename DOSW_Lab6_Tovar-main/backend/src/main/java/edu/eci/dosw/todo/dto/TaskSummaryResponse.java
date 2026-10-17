package edu.eci.dosw.todo.dto;

import edu.eci.dosw.todo.entity.TaskPriority;
import edu.eci.dosw.todo.entity.TaskStatus;

import java.util.Map;

public record TaskSummaryResponse(
        long total,
        Map<TaskStatus, Long> byStatus,
        Map<TaskPriority, Long> byPriority,
        long overdue,
        double completionPercentage
) {
}
