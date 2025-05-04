using System.ComponentModel.DataAnnotations;

namespace Application.Dtos.TaskDto;

public class TaskIdDto
{
    [Required]
    public int TaskId { get; set; }
}