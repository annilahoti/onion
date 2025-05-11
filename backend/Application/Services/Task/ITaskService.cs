using Application.Dtos.TaskDto;

namespace Application.Services.Task;

public interface ITaskService
{
    Task<List<TaskDto>> GetAllTasks();
    Task<TaskDto> GetTaskById(int taskId);
    Task<List<TaskDto>> GetTaskByListId(int listId);
    Task<TaskDto> UpdateTask(UpdateTaskDto updateTaskDto);
    Task<TaskDto> DeleteTask(TaskIdDto taskIdDto);
    Task<TaskDto> CreateTask(CreateTaskDto createTaskDto);
    Task<TaskDto> ChangeIndexTask(ChangeIndexTaskDto changeIndexTaskDto);
    Task<TaskDto> ToggleChecked(ToggleCheckedDto dto);
}