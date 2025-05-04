using Domain.Entities;
using Task = Domain.Entities.Task;

namespace Domain.Interfaces;

public interface ITaskRepository
{
    Task<IEnumerable<Task>> GetTasks(
        int? taskId = null,
        int? index = null,
        DateTime? dateCreated = null,
        DateTime? dueDate = null,
        int? listId = null
    );
    Task<Task> CreateTask(Task task);
    Task<Task> UpdateTask(Task task);
    Task<Task> DeleteTask(int taskId);
}