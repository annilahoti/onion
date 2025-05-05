using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

public class Task
{
    [Key]
    public int TaskId { get; set; }
    public int Index { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime DateCreated { get; set; }
    public DateTime DueDate { get; set; }
    public int ListId { get; set; }
    public bool IsDeleted { get; set; }

    public List List { get; set; }

    public Task() { }

    public Task(int index, string title, DateTime dateCreated, int listId, bool isDeleted)
    {
        Index = index;
        Title = title;
        DateCreated = dateCreated;
        ListId = listId;
        IsDeleted = isDeleted;
    }
}