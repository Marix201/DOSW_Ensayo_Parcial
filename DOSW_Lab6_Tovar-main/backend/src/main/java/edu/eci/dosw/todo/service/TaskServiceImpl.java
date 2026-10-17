package edu.eci.dosw.todo.service;

import edu.eci.dosw.todo.dto.TaskBatchRequest;
import edu.eci.dosw.todo.dto.TaskCreateRequest;
import edu.eci.dosw.todo.dto.TaskResponse;
import edu.eci.dosw.todo.dto.TaskUpdateRequest;
import edu.eci.dosw.todo.entity.TaskEntity;
import edu.eci.dosw.todo.entity.TaskPriority;
import edu.eci.dosw.todo.entity.TaskStatus;
import edu.eci.dosw.todo.exception.TaskNotFoundException;
import edu.eci.dosw.todo.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> findAll() {
        return taskRepository.findAll().stream()
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

    @Override
    @Transactional
    public void deleteBatch(TaskBatchRequest request) {
        taskRepository.deleteAll(getAllEntitiesOrThrow(request.ids()));
    }

    @Override
    @Transactional
    public List<TaskResponse> completeBatch(TaskBatchRequest request) {
        List<TaskEntity> tasks = getAllEntitiesOrThrow(request.ids());
        tasks.forEach(task -> task.setStatus(TaskStatus.COMPLETED));
        return taskRepository.saveAll(tasks).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteCompleted() {
        List<TaskEntity> completed = taskRepository.findAll().stream()
                .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                .toList();
        taskRepository.deleteAll(completed);
    }

    // Loads every requested task or fails with 404 before any change is made (all-or-nothing).
    private List<TaskEntity> getAllEntitiesOrThrow(List<Long> ids) {
        Set<Long> uniqueIds = new LinkedHashSet<>(ids);
        List<TaskEntity> tasks = taskRepository.findAllById(uniqueIds);
        Set<Long> found = tasks.stream().map(TaskEntity::getId).collect(Collectors.toSet());
        for (Long id : uniqueIds) {
            if (!found.contains(id)) {
                throw new TaskNotFoundException(id);
            }
        }
        return tasks;
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
