using System.ComponentModel.DataAnnotations;

namespace Application.Dtos.TaskDto;

public class ChangeIndexTaskDto
{
    [Required]
    public int TaskId { get; set; }
    [Required]
    public int newIndex { get; set; }
    [Required]
    public int ListId { get; set; }
}