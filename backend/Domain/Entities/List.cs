using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

public class List
{
    [Key]
    public int ListId { get; set; }

    public string Title { get; set; }
    public int Index { get; set; }
    public DateTime DateCreated { get; set; }
    public bool IsDeleted { get; set; }
    public string OwnerId { get; set; }
    public User User { get; set; }
    public List<Task> Tasks { get; set; }

    public List(){}

    public List(int listId,string title, int index, DateTime dateCreated, bool isDeleted, string ownerId)
    {
        ListId = listId;
        Title = title;
        Index = index;
        DateCreated = dateCreated;
        IsDeleted = isDeleted;
        OwnerId = ownerId;
        
    }

    public List(string title, int index,DateTime dateCreated, bool isDeleted, string ownerId)
    {
        Title = title;
        Index = index;
        DateCreated = dateCreated;
        IsDeleted = isDeleted;
        OwnerId = ownerId;
    }
}