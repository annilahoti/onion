using System.ComponentModel.DataAnnotations;

namespace Application.Dtos.TaskDto;

public class CreateTaskDto
{
    [Required]
    public string Title { get; set; }
    [Required]
    public int ListId { get; set; }
}