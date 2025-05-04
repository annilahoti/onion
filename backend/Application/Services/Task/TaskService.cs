using Application.Dtos.TaskDto;
using Application.Services.Authorization;
using Domain.Interfaces;

namespace Application.Services.Task;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IListRepository _listRepository;
    private readonly IUserRepository _userRepository;
    private readonly UserContext _userContext;
    private readonly AuthorizationService _authorizationService;

    public TaskService(ITaskRepository taskRepository, IUserRepository userRepository, UserContext userContext, IListRepository listRepository)
    {
        _taskRepository = taskRepository;
        _userRepository = userRepository;
        _userContext = userContext;
        _listRepository = listRepository;
    }
    
    public async Task<List<TaskDto>> GetAllTasks()
    {
        var tasks = await _taskRepository.GetTasks();
        var tasksDto = new List<TaskDto>();
        foreach (var task in tasks)
        {
            tasksDto.Add(new TaskDto(task));            
        }

        return tasksDto;
    }
    public async Task<TaskDto> GetTaskById(int taskId)
    {
        if (!await _authorizationService.CanAccessTask(_userContext.Id, taskId))
            throw new Exception("You are not authorized");
        
        var task = (await _taskRepository.GetTasks(taskId: taskId)).FirstOrDefault();
        if (task == null) throw new Exception("Task not found");

        return new TaskDto(task);
    }
    public async Task<List<TaskDto>> GetTaskByListId(int listId)
    {
        var accessesList = await _authorizationService.CanAccessList(_userContext.Id, listId);
        if (!accessesList  && _userContext.Role != "Admin") throw new Exception("You are not authorized");
        
        var tasks = await _taskRepository.GetTasks(listId: listId);
        var tasksDto = new List<TaskDto>();
        foreach (var task in tasks)
        {
            tasksDto.Add(new TaskDto(task));
        }

        return tasksDto;
    }
    public async Task<TaskDto> UpdateTask(UpdateTaskDto updateTaskDto)
    {
        var accessesTask = await _authorizationService.CanAccessTask(_userContext.Id, updateTaskDto.TaskId);
        if (!accessesTask && _userContext.Role != "Admin") throw new Exception("You are not authorized");
        
        var task = (await _taskRepository.GetTasks(taskId: updateTaskDto.TaskId)).FirstOrDefault();
        if (task == null) throw new Exception("Task not found");

        task.Title = updateTaskDto.Title;
        task.Description = updateTaskDto.Description;
        task.DueDate = updateTaskDto.DueDate;

        var updatedTask = await _taskRepository.UpdateTask(task);
        
       
        return new TaskDto(updatedTask);
    }
    public async Task<TaskDto> CreateTask(CreateTaskDto createTaskDto)
    {
        var accessesList = await _authorizationService.CanAccessList(_userContext.Id, createTaskDto.ListId);
        if (!accessesList && _userContext.Role != "Admin") throw new Exception("You are not authorized");
        
        var list = (await _listRepository.GetLists(listId: createTaskDto.ListId)).FirstOrDefault();
        if (list == null) throw new Exception("List not found");

        
        var newIndex = list.Tasks.Count(); 
        var newTask = new Domain.Entities.Task(
            newIndex,
            createTaskDto.Title,
            DateTime.Now,
            createTaskDto.ListId,
            false);
        
        var task = await _taskRepository.CreateTask(newTask);
        
        return new TaskDto(newTask);
    }

    public async Task<TaskDto> ChangeIndexTask(ChangeIndexTaskDto changeIndexTaskDto)
    {
        var task = (await _taskRepository.GetTasks(taskId: changeIndexTaskDto.TaskId)).FirstOrDefault(t => !t.IsDeleted);
        if (task == null) 
            throw new Exception("Task not found");

        int oldIndex = task.Index;
        int newIndex = changeIndexTaskDto.newIndex;

        if (oldIndex == newIndex)
            return new TaskDto(task);
        
        var allTasks = await _taskRepository.GetTasks(taskId: task.TaskId);
        var orderedTasks = allTasks.Where(t => !t.IsDeleted).OrderBy(t => t.Index).ToList();

        orderedTasks.Remove(task);
        orderedTasks.Insert(newIndex, task);
        
        for (int i = 0; i < orderedTasks.Count; i++)
        {
            orderedTasks[i].Index = i;
            await _taskRepository.UpdateTask(orderedTasks[i]);
        }

        return new TaskDto(task);

    }

    public async Task<TaskDto> DeleteTask(TaskIdDto taskIdDto)
    {
            var tasks = await _taskRepository.GetTasks(taskId: taskIdDto.TaskId);
            var task = tasks.FirstOrDefault();

            if (task == null)
                throw new Exception("Task not found");

            if (!await _authorizationService.CanAccessTask(_userContext.Id, taskId: taskIdDto.TaskId))
                throw new Exception("You are not authorized");

            task.IsDeleted = !task.IsDeleted;
            var updatedTask = await _taskRepository.UpdateTask(task);

            var siblingTasks = await _taskRepository.GetTasks(listId: task.ListId);
            var affectedTasks = siblingTasks
                .Where(t => !t.IsDeleted && t.Index > task.Index)
                .OrderBy(t => t.Index)
                .ToList();

            foreach (var t in affectedTasks)
            {
                t.Index -= 1;
                await _taskRepository.UpdateTask(t);
            }

            return new TaskDto(updatedTask);

    }
}