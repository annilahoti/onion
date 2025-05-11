using Domain.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Task = Domain.Entities.Task;

namespace Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Task>> GetTasks(int? taskId = null, int? index = null,
        DateTime? dateCreated = null, DateTime? dueDate = null, int? listId = null)
    {
        var query = _context.Tasks
            .Include(t => t.List)
            .ThenInclude(l => l.Tasks).AsQueryable();
        
        if (taskId.HasValue)
            query = query.Where(t => t.TaskId == taskId);
        if (index.HasValue)
            query = query.Where(t => t.Index == index);
        if (dateCreated.HasValue)
            query = query.Where(t => t.DateCreated.Date == dateCreated.Value.Date);
        if (dueDate.HasValue)
            query = query.Where(t => t.DueDate.Date == dueDate.Value.Date);
        if (listId.HasValue)
            query = query.Where(t => t.ListId == listId);
        
        return await query.ToListAsync();
    }

    public async Task<Task> CreateTask(Task task)
    {
        await _context.Tasks.AddAsync(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<Task> UpdateTask(Task task)
    {
        var existingTask = await _context.Tasks.FindAsync(task.TaskId);
        if (existingTask == null)
        {
            throw new Exception("Task not found");
        }
        existingTask.Title = task.Title;
        existingTask.DueDate = task.DueDate;

        await _context.SaveChangesAsync();
        return existingTask;
    }

    public async Task<Task> DeleteTask(int taskId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null)
        {
            throw new Exception("Task not found");
        }
        task.IsDeleted = true;
        await _context.SaveChangesAsync();
        
        return task;
    }
}