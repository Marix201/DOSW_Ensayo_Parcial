package edu.eci.dosw.todo.service;

import edu.eci.dosw.todo.dto.TaskCreateRequest;
import edu.eci.dosw.todo.dto.TaskResponse;
import edu.eci.dosw.todo.dto.TaskUpdateRequest;
import edu.eci.dosw.todo.entity.TaskEntity;
import edu.eci.dosw.todo.entity.TaskPriority;
import edu.eci.dosw.todo.entity.TaskStatus;
import edu.eci.dosw.todo.exception.TaskNotFoundException;
import edu.eci.dosw.todo.exception.TaskQueryException;
import edu.eci.dosw.todo.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class TaskServiceImpl implements TaskService {

    private static final Set<String> SORT_FIELDS = Set.of("dueDate", "priority", "createdAt", "title");

    private final TaskRepository taskRepository;

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> findAll(String sort, String direction) {
        Comparator<TaskEntity> comparator = buildComparator(sort, direction);
        return taskRepository.findAll().stream()
                .sorted(comparator)
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse findById(Long id) {
        return toResponse(getEntityOrThrow(id));
    }

    @Override
    @Transactional
    public TaskResponse create(TaskCreateRequest request) {
        TaskEntity task = new TaskEntity();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(TaskStatus.PENDING);
        task.setPriority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM);
        task.setDueDate(request.dueDate());
        task.setCreatedAt(LocalDateTime.now());
        return toResponse(taskRepository.save(task));
    }

    @Override
    @Transactional
    public TaskResponse update(Long id, TaskUpdateRequest request) {
        TaskEntity task = getEntityOrThrow(id);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        return toResponse(taskRepository.save(task));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException(id);
        }
        taskRepository.deleteById(id);
    }

    private Comparator<TaskEntity> buildComparator(String sort, String direction) {
        String field = (sort == null || sort.isBlank()) ? "createdAt" : sort;
        if (!SORT_FIELDS.contains(field)) {
            throw new TaskQueryException("Invalid sort field '" + sort + "'. Allowed: dueDate, priority, createdAt, title");
        }
        boolean descending;
        if (direction == null || direction.isBlank()) {
            descending = (sort == null || sort.isBlank());
        } else if ("asc".equalsIgnoreCase(direction)) {
            descending = false;
        } else if ("desc".equalsIgnoreCase(direction)) {
            descending = true;
        } else {
            throw new TaskQueryException("Invalid sort direction '" + direction + "'. Allowed: asc, desc");
        }

        if (field.equals("dueDate")) {
            // Tasks without due date always go last, in both directions.
            Comparator<LocalDate> dates = descending ? Comparator.reverseOrder() : Comparator.naturalOrder();
            return Comparator.comparing(TaskEntity::getDueDate, Comparator.nullsLast(dates));
        }
        Comparator<TaskEntity> comparator = switch (field) {
            case "priority" -> Comparator.comparingInt(task -> task.getPriority().ordinal());
            case "title" -> Comparator.comparing(task -> task.getTitle().toLowerCase(Locale.ROOT));
            default -> Comparator.comparing(TaskEntity::getCreatedAt);
        };
        return descending ? comparator.reversed() : comparator;
    }

    private TaskEntity getEntityOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    private TaskResponse toResponse(TaskEntity task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt()
        );
    }
}
