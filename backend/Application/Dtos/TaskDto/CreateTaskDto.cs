using System.ComponentModel.DataAnnotations;

namespace Application.Dtos.TaskDto;

public class CreateTaskDto
{
    [Required]
    [MinLength(2, ErrorMessage = "Title must be at least 2 characters long")]
    [MaxLength(50, ErrorMessage = "Title cannot exceed 120 characters")]
    public string Title { get; set; }
    [Required]
    public int ListId { get; set; }
    public DateTime DueDate { get; set; } = DateTime.MinValue;
    
}