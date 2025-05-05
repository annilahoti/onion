using Task = Domain.Entities.Task;

namespace Application.Dtos.TaskDto;

public class TaskDto
{
    public int TaskId { get; set; }
    public string Title { get; set; }
    public int ListId { get; set; }
    public int Index { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime DateAdded { get; set; }
    
    public TaskDto(Task task)
    {
        TaskId = task.TaskId;
        Title = task.Title;
        ListId = task.ListId;
        Index = task.Index;
        DueDate = task.DueDate;
        DateAdded = task.DateCreated;
    }
}