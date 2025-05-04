using Domain.Interfaces;

namespace Application.Services.Authorization;

public class AuthorizationService : IAuthorizationService
{
    private readonly IUserRepository _userRepo;
    private readonly IListRepository _listRepo;
    private readonly ITaskRepository _taskRepo;
 
    public AuthorizationService(IUserRepository userRepo, IListRepository listRepo, ITaskRepository taskRepo)
    {
        _userRepo = userRepo;
        _listRepo = listRepo;
        _taskRepo = taskRepo;
    }

    public async Task<bool> CanAccessTask(string userId, int taskId)
    {
        var user = (await _userRepo.GetUsers(userId: userId)).FirstOrDefault();
        
        var task = (await _taskRepo.GetTasks(taskId: taskId)).FirstOrDefault();
        if (user == null || task == null) throw new Exception("Task not found");

        var list = (await _listRepo.GetLists(listId: task.ListId)).FirstOrDefault();
        if (list == null) throw new Exception("List not found");
        
        return true;
    }
    
    public async Task<bool> IsDeleted(string userId)
    {
        var user = (await _userRepo.GetUsers(userId: userId)).FirstOrDefault();
        if (user is null || user.IsDeleted) return true;
        return false;
    }

    public async Task<bool> IsAdmin(string userId)
    {
        var user = (await _userRepo.GetUsers(userId: userId)).FirstOrDefault();
        if (user is null) return false;
        else if (user.Role == "Admin") return true;
        return false;
    }
    
    public async Task<bool> CanAccessList(string userId, int listId)
     {
         var user = (await _userRepo.GetUsers(userId: userId)).FirstOrDefault();
        
         var list = (await _listRepo.GetLists(listId: listId)).FirstOrDefault();
         if (list == null) throw new Exception("List not found");

        return true;
    }
}