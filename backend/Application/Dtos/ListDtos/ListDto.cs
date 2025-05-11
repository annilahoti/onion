using Domain.Entities;
using Task = Domain.Entities.Task;
namespace Application.Dtos.ListDtos;

public class ListDto
{
    public int ListId { get; set; }
    public string Title { get; set; }
    public int Index { get; set; }
    public string OwnerId { get; set; }
    public DateTime DateCreated { get; set; }
     public List<Task> Tasks { get; set; }
    public ListDto(List list)
    {
        ListId = list.ListId;
        Title = list.Title;
        Index = list.Index;
        OwnerId = list.OwnerId;
        DateCreated = list.DateCreated;
        Tasks = list.Tasks;
    }
}