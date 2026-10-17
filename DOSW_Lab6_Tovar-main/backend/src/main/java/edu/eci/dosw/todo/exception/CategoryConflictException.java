package edu.eci.dosw.todo.exception;

public class CategoryConflictException extends RuntimeException {

    private CategoryConflictException(String message) {
        super(message);
    }

    public static CategoryConflictException duplicateName(String name) {
        return new CategoryConflictException("Category '" + name + "' already exists");
    }

    public static CategoryConflictException inUse(Long id) {
        return new CategoryConflictException(
                "Category with id " + id + " is assigned to tasks and cannot be deleted");
    }
}
