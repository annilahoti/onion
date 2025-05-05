using System.ComponentModel.DataAnnotations;

namespace Application.Dtos.TaskDto;

public class UpdateTaskDto
{
    [Required]
    public int TaskId { get; set; }
    [Required]
    [MinLength(2, ErrorMessage = "Title must be at least 2 characters long")]
    [MaxLength(50, ErrorMessage = "Title cannot exceed 120 characters")]
    public string Title { get; set; }
 
    [Required]
    
    public DateTime DueDate { get; set; }
}